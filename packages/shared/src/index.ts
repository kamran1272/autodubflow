export const sharedStatus = 'shared-ready';

export { getOutputPreset, outputPresets } from './output-presets';
export type { OutputPreset, OutputPresetId } from './output-presets';

export type ServiceHealth = {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
};

export const createHealthPayload = (service: string, status: ServiceHealth['status'] = 'ok'): ServiceHealth => ({
  status,
  service,
  timestamp: new Date().toISOString(),
  uptimeSeconds: Math.round(process.uptime()),
});
