export const agentStages = [
  'ELIGIBILITY_CHECK',
  'MEDIA_INGESTION',
  'MEDIA_VALIDATION',
  'DUBBING',
  'VIDEO_ANALYSIS',
  'SMART_REFRAME',
  'EXISTING_CAPTION_DETECTION',
  'CAPTION_MASK',
  'TRANSITIONS',
  'TARGET_CAPTION_GENERATION',
  'RENDER',
  'QUALITY_CONTROL',
  'METADATA',
  'READY_BUFFER',
  'SCHEDULING',
  'PUBLISH',
  'VERIFY',
] as const;

export type AgentStage = (typeof agentStages)[number];

export type AgentState = {
  automationId: string;
  sourceVideoId: string;
  rightsConfirmed: boolean;
  enabledStages: readonly AgentStage[];
  completedStages: readonly AgentStage[];
  failedStage?: AgentStage;
};

export type AgentObservation = {
  id: string;
  sourceVideoId: string;
  kind: 'SOURCE_EVENT' | 'TOOL_RESULT' | 'TIMER';
  payload: unknown;
};

export type AgentAction = {
  idempotencyKey: string;
  sourceVideoId: string;
  stage: AgentStage;
};

export type AgentToolSuccess = {
  ok: true;
  stage: AgentStage;
  idempotencyKey: string;
  output: unknown;
};

export type AgentToolFailure = {
  ok: false;
  stage: AgentStage;
  idempotencyKey: string;
  errorCode: string;
  message: string;
  retryable: boolean;
};

export type AgentToolResult = AgentToolSuccess | AgentToolFailure;

export type AgentDecision =
  | { kind: 'RUN'; action: AgentAction }
  | { kind: 'WAIT'; reason: string }
  | { kind: 'BLOCKED'; reason: string }
  | { kind: 'COMPLETE' };

export type AgentTool = {
  stage: AgentStage;
  execute: (action: AgentAction, observation: AgentObservation) => Promise<AgentToolResult>;
};

export type AgentStore = {
  loadState: (sourceVideoId: string) => Promise<AgentState>;
  recordObservation: (observation: AgentObservation) => Promise<void>;
  recordAction: (action: AgentAction) => Promise<void>;
  applyToolResult: (state: AgentState, result: AgentToolResult) => Promise<AgentState>;
};

export type AgentRuntimeOptions = {
  maxSteps?: number;
};

const stageIndex = (stage: AgentStage) => agentStages.indexOf(stage);

export function selectNextDecision(state: AgentState): AgentDecision {
  if (!state.rightsConfirmed) {
    return { kind: 'BLOCKED', reason: 'Source processing requires confirmed ownership or authorization.' };
  }

  if (state.failedStage) {
    return { kind: 'WAIT', reason: `Stage ${state.failedStage} requires retry or review.` };
  }

  const nextStage = agentStages.find(
    (stage) => state.enabledStages.includes(stage) && !state.completedStages.includes(stage),
  );

  if (!nextStage) {
    return { kind: 'COMPLETE' };
  }

  const previousEnabledStages = agentStages.filter(
    (stage) => stageIndex(stage) < stageIndex(nextStage) && state.enabledStages.includes(stage),
  );
  const missingPreviousStage = previousEnabledStages.find(
    (stage) => !state.completedStages.includes(stage),
  );

  if (missingPreviousStage) {
    return { kind: 'WAIT', reason: `Waiting for ${missingPreviousStage} before ${nextStage}.` };
  }

  return {
    kind: 'RUN',
    action: {
      idempotencyKey: `${state.sourceVideoId}:${nextStage}`,
      sourceVideoId: state.sourceVideoId,
      stage: nextStage,
    },
  };
}

export function validateToolResult(action: AgentAction, result: AgentToolResult): AgentToolResult {
  if (result.stage !== action.stage) {
    throw new Error(`Tool result stage ${result.stage} does not match action ${action.stage}.`);
  }

  if (result.idempotencyKey !== action.idempotencyKey) {
    throw new Error('Tool result idempotency key does not match the requested action.');
  }

  if (result.ok && result.output === undefined) {
    throw new Error(`Tool ${action.stage} returned success without a result payload.`);
  }

  return result;
}

export async function runAgentCycle(
  sourceVideoId: string,
  observe: () => Promise<AgentObservation>,
  store: AgentStore,
  tools: ReadonlyMap<AgentStage, AgentTool>,
  options: AgentRuntimeOptions = {},
): Promise<{ state: AgentState; steps: number; decision: AgentDecision }> {
  const maxSteps = options.maxSteps ?? 1;
  let state = await store.loadState(sourceVideoId);
  let observation = await observe();
  await store.recordObservation(observation);

  for (let steps = 0; steps < maxSteps; steps += 1) {
    const decision = selectNextDecision(state);

    if (decision.kind !== 'RUN') {
      return { state, steps, decision };
    }

    const tool = tools.get(decision.action.stage);
    if (!tool) {
      return {
        state,
        steps,
        decision: { kind: 'WAIT', reason: `No tool is registered for ${decision.action.stage}.` },
      };
    }

    await store.recordAction(decision.action);
    const result = validateToolResult(
      decision.action,
      await tool.execute(decision.action, observation),
    );
    await store.recordObservation({
      id: `${decision.action.idempotencyKey}:result`,
      sourceVideoId,
      kind: 'TOOL_RESULT',
      payload: result,
    });
    state = await store.applyToolResult(state, result);

    if (!result.ok) {
      return {
        state,
        steps: steps + 1,
        decision: { kind: 'WAIT', reason: result.retryable ? 'Retryable tool failure.' : 'Manual review required.' },
      };
    }

    observation = {
      id: `${decision.action.idempotencyKey}:result`,
      sourceVideoId,
      kind: 'TOOL_RESULT',
      payload: result.output,
    };
  }

  return {
    state,
    steps: maxSteps,
    decision: { kind: 'WAIT', reason: 'Agent step limit reached.' },
  };
}
