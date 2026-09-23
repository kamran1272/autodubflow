import type { SubtitleFormat } from './constants.js';

export interface SubtitleCue {
  index?: number;
  start: number;
  end: number;
  text: string;
  speaker?: string | null;
}

const MAX_CUE_CHARACTERS = 84;
const MAX_CUE_DURATION = 7;
const MIN_CUE_DURATION = 0.9;
const READING_CHARS_PER_SECOND = 17;

function pad(value: number, size = 2): string {
  return String(Math.floor(value)).padStart(size, '0');
}

function srtTimestamp(seconds: number): string {
  const value = Math.max(0, seconds);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);
  const ms = Math.round((value - Math.floor(value)) * 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function vttTimestamp(seconds: number): string {
  return srtTimestamp(seconds).replace(',', '.');
}

function splitText(text: string, limit = MAX_CUE_CHARACTERS): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= limit) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return [lines.join('\n')];
  // Re-flow into chunks of at most two lines.
  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    chunks.push(lines.slice(i, i + 2).join('\n'));
  }
  return chunks;
}

/**
 * Turns timestamped segments into broadcast-friendly cues: long segments are
 * split on the reading speed budget and given a minimum on-screen duration so
 * generated captions stay legible.
 */
export function buildCues(segments: SubtitleCue[]): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  for (const segment of segments) {
    const text = (segment.text ?? '').trim();
    if (!text) continue;
    const start = Math.max(0, segment.start);
    const end = Math.max(start + MIN_CUE_DURATION, segment.end);
    const available = end - start;
    const pieces = splitText(text);
    const totalCharacters = pieces.reduce((sum, piece) => sum + piece.replace(/\n/g, ' ').length, 0) || 1;

    if (pieces.length === 1 && available <= MAX_CUE_DURATION) {
      cues.push({ start, end, text, speaker: segment.speaker ?? null });
      continue;
    }

    let cursor = start;
    pieces.forEach((piece, position) => {
      const share = piece.replace(/\n/g, ' ').length / totalCharacters;
      const readingTime = piece.replace(/\n/g, ' ').length / READING_CHARS_PER_SECOND;
      const pieceDuration = Math.max(MIN_CUE_DURATION, Math.min(MAX_CUE_DURATION, Math.max(available * share, readingTime)));
      const pieceEnd = position === pieces.length - 1 ? end : Math.min(end, cursor + pieceDuration);
      cues.push({ start: cursor, end: pieceEnd, text: piece, speaker: segment.speaker ?? null });
      cursor = pieceEnd;
    });
  }
  return cues.sort((a, b) => a.start - b.start).map((cue, index) => ({ ...cue, index: index + 1 }));
}

export function toSrt(segments: SubtitleCue[]): string {
  const cues = buildCues(segments);
  return `${cues
    .map((cue, index) => `${index + 1}\n${srtTimestamp(cue.start)} --> ${srtTimestamp(cue.end)}\n${cue.text}`)
    .join('\n\n')}\n`;
}

export function toVtt(segments: SubtitleCue[]): string {
  const cues = buildCues(segments);
  return `WEBVTT\n\n${cues
    .map((cue, index) => `${index + 1}\n${vttTimestamp(cue.start)} --> ${vttTimestamp(cue.end)}\n${cue.text}`)
    .join('\n\n')}\n`;
}

export function renderSubtitles(segments: SubtitleCue[], format: SubtitleFormat): string {
  return format === 'vtt' ? toVtt(segments) : toSrt(segments);
}

/** Parses SRT or VTT content back into cues (used by the subtitle editor). */
export function parseSubtitles(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/^WEBVTT.*?\n\n/s, '');
  const blocks = normalized.split(/\n{2,}/);
  const cues: SubtitleCue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) continue;
    const timeLineIndex = lines.findIndex((line) => line.includes('-->'));
    if (timeLineIndex < 0) continue;
    const [rawStart, rawEnd] = lines[timeLineIndex].split('-->').map((value) => value.trim());
    const toSeconds = (value: string) => {
      const [time, ms = '0'] = value.replace(',', '.').split('.');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds + Number(`0.${ms}`);
    };
    cues.push({
      start: toSeconds(rawStart),
      end: toSeconds(rawEnd),
      text: lines.slice(timeLineIndex + 1).join('\n'),
    });
  }
  return cues;
}
