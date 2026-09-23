import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { env } from '../../config/env.js';
import { ProviderError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';

export interface OpenAiOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface OpenAiRequestOptions extends OpenAiOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  form?: FormData;
}

function credentials(options: OpenAiOptions) {
  const apiKey = options.apiKey ?? env.OPENAI_API_KEY;
  const baseUrl = (options.baseUrl ?? env.OPENAI_BASE_URL).replace(/\/$/, '');
  if (!apiKey) {
    throw new ProviderError('openai', 'OPENAI_API_KEY is not configured. Set AI_MODE=mock or add a key.');
  }
  return { apiKey, baseUrl };
}

/** Thin, retrying wrapper around the OpenAI REST API. */
export async function openAiRequest<T>(path: string, options: OpenAiRequestOptions = {}): Promise<T> {
  const { apiKey, baseUrl } = credentials(options);
  const attempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 120_000);
    const abortExternal = () => controller.abort();
    options.signal?.addEventListener('abort', abortExternal, { once: true });

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method ?? 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(options.form ? {} : { 'Content-Type': 'application/json' }),
        },
        body: options.form ?? (options.body ? JSON.stringify(options.body) : undefined),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < attempts) {
          logger.warn({ status: response.status, attempt, path }, 'openai request failed, retrying');
          await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (attempt - 1)));
          continue;
        }
        throw new ProviderError('openai', `${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ProviderError) throw error;
      if (attempt >= attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (attempt - 1)));
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abortExternal);
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'unknown error';
  throw new ProviderError('openai', `request to ${path} failed: ${message}`);
}

/** Downloads a binary resource (audio) from OpenAI with retry handling. */
export async function openAiBinaryRequest(
  path: string,
  options: OpenAiRequestOptions & { accept?: string } = {},
): Promise<{ buffer: Buffer; contentType: string }> {
  const { apiKey, baseUrl } = credentials(options);
  const attempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 180_000);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: options.method ?? 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(options.accept ? { Accept: options.accept } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        if ((response.status === 429 || response.status >= 500) && attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (attempt - 1)));
          continue;
        }
        throw new ProviderError('openai', `${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: response.headers.get('content-type') ?? 'application/octet-stream',
      };
    } catch (error) {
      lastError = error;
      if (error instanceof ProviderError) throw error;
      if (attempt >= attempts) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (attempt - 1)));
    } finally {
      clearTimeout(timeout);
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'unknown error';
  throw new ProviderError('openai', `binary request to ${path} failed: ${message}`);
}

/** Adds a local audio file to a multipart form the way the Whisper API expects. */
export async function appendAudioFile(form: FormData, localPath: string): Promise<void> {
  const buffer = await readFile(localPath);
  const blob = new Blob([new Uint8Array(buffer)], { type: guessAudioMime(localPath) });
  form.append('file', blob, basename(localPath));
}

export function guessAudioMime(path: string): string {
  if (/\.wav$/i.test(path)) return 'audio/wav';
  if (/\.mp3$/i.test(path)) return 'audio/mpeg';
  if (/\.m4a$/i.test(path)) return 'audio/mp4';
  if (/\.flac$/i.test(path)) return 'audio/flac';
  if (/\.ogg$/i.test(path)) return 'audio/ogg';
  if (/\.webm$/i.test(path)) return 'audio/webm';
  return 'application/octet-stream';
}
