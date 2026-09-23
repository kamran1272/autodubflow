import { DUBBING_STAGES, type PipelineStageDefinition } from './constants.js';

export function getStage(stageId: string): PipelineStageDefinition | undefined {
  return DUBBING_STAGES.find((stage) => stage.id === stageId);
}

export function stageLabel(stageId: string): string {
  return getStage(stageId)?.label ?? stageId.replace(/_/g, ' ');
}

export function stageIndex(stageId: string): number {
  return DUBBING_STAGES.findIndex((stage) => stage.id === stageId);
}

export function nextStage(stageId: string): string {
  const index = stageIndex(stageId);
  if (index < 0) return 'completed';
  return DUBBING_STAGES[Math.min(index + 1, DUBBING_STAGES.length - 1)].id;
}

/**
 * Converts a per-stage completion percentage into the overall pipeline
 * percentage using the declared stage weights. The result is monotonic so a
 * progress bar never moves backwards when a stage advances.
 */
export function computeOverallProgress(stageId: string, stageProgress = 0): number {
  const index = stageIndex(stageId);
  if (index < 0) return 0;
  if (stageId === 'completed') return 100;

  const clamped = Math.min(100, Math.max(0, stageProgress));
  let progress = 0;
  for (let i = 0; i < index; i += 1) progress += DUBBING_STAGES[i].weight;
  progress += (DUBBING_STAGES[index].weight * clamped) / 100;
  return Math.min(100, Math.round(progress));
}

export function isTerminalStage(stageId: string): boolean {
  return stageId === 'completed';
}
