import assert from 'node:assert/strict';
import test from 'node:test';
import {
  type AgentState,
  type AgentStore,
  runAgentCycle,
  selectNextDecision,
  type AgentToolResult,
} from './index.js';

const createState = (overrides: Partial<AgentState> = {}): AgentState => ({
  automationId: 'automation-1',
  sourceVideoId: 'video-1',
  rightsConfirmed: true,
  enabledStages: ['ELIGIBILITY_CHECK', 'MEDIA_INGESTION'],
  completedStages: [],
  ...overrides,
});

test('blocks processing until source rights are confirmed', () => {
  const decision = selectNextDecision(createState({ rightsConfirmed: false }));

  assert.deepEqual(decision, {
    kind: 'BLOCKED',
    reason: 'Source processing requires confirmed ownership or authorization.',
  });
});

test('runs a validated tool and persists the result before selecting the next step', async () => {
  let state = createState();
  const observations: string[] = [];
  const actions: string[] = [];
  const store: AgentStore = {
    loadState: async () => state,
    recordObservation: async (observation) => {
      observations.push(observation.kind);
    },
    recordAction: async (action) => {
      actions.push(action.stage);
    },
    applyToolResult: async (currentState, result) => {
      if (!result.ok) return { ...currentState, failedStage: result.stage };
      state = {
        ...currentState,
        completedStages: [...currentState.completedStages, result.stage],
      };
      return state;
    },
  };

  const result = await runAgentCycle(
    'video-1',
    async () => ({ id: 'source-1', sourceVideoId: 'video-1', kind: 'SOURCE_EVENT', payload: {} }),
    store,
    new Map([
      [
        'ELIGIBILITY_CHECK',
        {
          stage: 'ELIGIBILITY_CHECK',
          execute: async (action) => ({
            ok: true,
            stage: action.stage,
            idempotencyKey: action.idempotencyKey,
            output: { eligible: true },
          }),
        },
      ],
    ]),
  );

  assert.deepEqual(actions, ['ELIGIBILITY_CHECK']);
  assert.deepEqual(observations, ['SOURCE_EVENT', 'TOOL_RESULT']);
  assert.equal(result.state.completedStages[0], 'ELIGIBILITY_CHECK');
  assert.equal(result.decision.kind, 'WAIT');
});

test('does not turn a retryable tool failure into a success', async () => {
  const failure: AgentToolResult = {
    ok: false,
    stage: 'ELIGIBILITY_CHECK',
    idempotencyKey: 'video-1:ELIGIBILITY_CHECK',
    errorCode: 'PROVIDER_TIMEOUT',
    message: 'Provider timed out.',
    retryable: true,
  };
  let state = createState();
  const store: AgentStore = {
    loadState: async () => state,
    recordObservation: async () => undefined,
    recordAction: async () => undefined,
    applyToolResult: async (currentState, result) => {
      state = result.ok ? currentState : { ...currentState, failedStage: result.stage };
      return state;
    },
  };

  const result = await runAgentCycle(
    'video-1',
    async () => ({ id: 'source-1', sourceVideoId: 'video-1', kind: 'SOURCE_EVENT', payload: {} }),
    store,
    new Map([
      [
        'ELIGIBILITY_CHECK',
        {
          stage: 'ELIGIBILITY_CHECK',
          execute: async () => failure,
        },
      ],
    ]),
  );

  assert.equal(result.state.failedStage, 'ELIGIBILITY_CHECK');
  assert.deepEqual(result.decision, { kind: 'WAIT', reason: 'Retryable tool failure.' });
});

test('waits instead of claiming progress when a stage tool is unavailable', async () => {
  const store: AgentStore = {
    loadState: async () => createState(),
    recordObservation: async () => undefined,
    recordAction: async () => undefined,
    applyToolResult: async (state) => state,
  };

  const result = await runAgentCycle(
    'video-1',
    async () => ({ id: 'source-1', sourceVideoId: 'video-1', kind: 'SOURCE_EVENT', payload: {} }),
    store,
    new Map(),
  );

  assert.deepEqual(result.decision, {
    kind: 'WAIT',
    reason: 'No tool is registered for ELIGIBILITY_CHECK.',
  });
});
