import type { SourceVideoStatus } from './types.js';

export type { SourceVideoStatus } from './types.js';

export type WorkflowEventType =
  | 'SOURCE_DISCOVERED'
  | 'MEDIA_INGESTED'
  | 'ANALYSIS_COMPLETED'
  | 'DUBBING_COMPLETED'
  | 'EDITING_COMPLETED'
  | 'CAPTIONS_COMPLETED'
  | 'RENDER_COMPLETED'
  | 'QC_PASSED'
  | 'PUBLISH_REQUESTED'
  | 'PUBLISH_COMPLETED'
  | 'WORKFLOW_FAILED';

export type WorkflowEvent = {
  idempotencyKey: string;
  sourceVideoId: string;
  type: WorkflowEventType;
  occurredAt: string;
};

export type WorkflowState = {
  sourceVideoId: string;
  status: SourceVideoStatus;
  processedEventKeys: string[];
  failureReason?: string;
};

export type WorkflowResult = {
  state: WorkflowState;
  applied: boolean;
};

const transitions: Record<WorkflowEventType, { from: SourceVideoStatus[]; to: SourceVideoStatus }> = {
  SOURCE_DISCOVERED: { from: ['QUEUED'], to: 'QUEUED' },
  MEDIA_INGESTED: { from: ['QUEUED'], to: 'INGESTED' },
  ANALYSIS_COMPLETED: { from: ['INGESTED'], to: 'ANALYZING' },
  DUBBING_COMPLETED: { from: ['ANALYZING'], to: 'DUBBING' },
  EDITING_COMPLETED: { from: ['DUBBING'], to: 'EDITING' },
  CAPTIONS_COMPLETED: { from: ['EDITING'], to: 'CAPTIONING' },
  RENDER_COMPLETED: { from: ['CAPTIONING'], to: 'RENDERING' },
  QC_PASSED: { from: ['RENDERING'], to: 'READY' },
  PUBLISH_REQUESTED: { from: ['READY'], to: 'READY' },
  PUBLISH_COMPLETED: { from: ['READY'], to: 'PUBLISHED' },
  WORKFLOW_FAILED: { from: ['QUEUED', 'INGESTED', 'ANALYZING', 'DUBBING', 'EDITING', 'CAPTIONING', 'RENDERING', 'QC', 'READY'], to: 'FAILED' },
};

export function applyWorkflowEvent(state: WorkflowState, event: WorkflowEvent): WorkflowResult {
  if (event.sourceVideoId !== state.sourceVideoId) {
    throw new Error('Workflow event belongs to a different source video.');
  }

  if (state.processedEventKeys.includes(event.idempotencyKey)) {
    return { state, applied: false };
  }

  if (event.type === 'WORKFLOW_FAILED') {
    return {
      applied: true,
      state: {
        ...state,
        status: 'FAILED',
        failureReason: 'Workflow failed.',
        processedEventKeys: [...state.processedEventKeys, event.idempotencyKey],
      },
    };
  }

  const transition = transitions[event.type];
  if (!transition.from.includes(state.status)) {
    throw new Error(`Cannot apply ${event.type} while source video is ${state.status}.`);
  }

  return {
    applied: true,
    state: {
      ...state,
      status: transition.to,
      processedEventKeys: [...state.processedEventKeys, event.idempotencyKey],
    },
  };
}

export const initialWorkflowState = (sourceVideoId: string): WorkflowState => ({
  sourceVideoId,
  status: 'QUEUED',
  processedEventKeys: [],
});
