export type OutputPresetId =
  | 'youtube-shorts'
  | 'tiktok-vertical'
  | 'instagram-reels'
  | 'youtube-long-form'
  | 'square'
  | 'custom';

export type OutputPreset = {
  id: OutputPresetId;
  label: string;
  aspectRatio: string;
  width: number;
  height: number;
  safeArea: { top: number; right: number; bottom: number; left: number };
  captionPlacement: 'top' | 'center' | 'bottom' | 'custom';
  maxRecommendedDurationSeconds?: number;
  videoCodec: 'h264';
  audioCodec: 'aac';
};

export const outputPresets: Record<Exclude<OutputPresetId, 'custom'>, OutputPreset> = {
  'youtube-shorts': {
    id: 'youtube-shorts',
    label: 'YouTube Shorts',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    safeArea: { top: 180, right: 120, bottom: 280, left: 120 },
    captionPlacement: 'bottom',
    maxRecommendedDurationSeconds: 180,
    videoCodec: 'h264',
    audioCodec: 'aac',
  },
  'tiktok-vertical': {
    id: 'tiktok-vertical',
    label: 'TikTok Vertical',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    safeArea: { top: 180, right: 120, bottom: 300, left: 120 },
    captionPlacement: 'bottom',
    maxRecommendedDurationSeconds: 600,
    videoCodec: 'h264',
    audioCodec: 'aac',
  },
  'instagram-reels': {
    id: 'instagram-reels',
    label: 'Instagram Reels',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    safeArea: { top: 180, right: 120, bottom: 300, left: 120 },
    captionPlacement: 'bottom',
    maxRecommendedDurationSeconds: 900,
    videoCodec: 'h264',
    audioCodec: 'aac',
  },
  'youtube-long-form': {
    id: 'youtube-long-form',
    label: 'YouTube Long-form',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    safeArea: { top: 48, right: 48, bottom: 48, left: 48 },
    captionPlacement: 'bottom',
    videoCodec: 'h264',
    audioCodec: 'aac',
  },
  square: {
    id: 'square',
    label: 'Square',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    safeArea: { top: 96, right: 96, bottom: 96, left: 96 },
    captionPlacement: 'bottom',
    videoCodec: 'h264',
    audioCodec: 'aac',
  },
};

export const getOutputPreset = (id: OutputPresetId): OutputPreset | undefined =>
  id === 'custom' ? undefined : outputPresets[id];
