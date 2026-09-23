const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  uploadVideo: (file: File, onProgress: (progress: number) => void, signal?: AbortSignal) => new Promise<{ fileUrl: string; filename: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/uploads/videos`);
    xhr.timeout = 10 * 60 * 1000;
    xhr.upload.onloadstart = () => onProgress(1);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText) as { fileUrl: string; filename: string };
        resolve({ ...response, fileUrl: response.fileUrl.startsWith('http') ? response.fileUrl : `${API_BASE_URL}${response.fileUrl}` });
      }
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    xhr.onerror = () => reject(new Error('Upload service unavailable'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    const formData = new FormData();
    formData.append('file', file);
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(formData);
  }),
  getVoices: () => request<{ voices: Array<{ id: string; name: string; language: string; gender: string; style?: string; accent?: string }> }>('/api/voices'),
  getProjects: () => request<{ projects: Array<Record<string, unknown>> }>('/api/projects'),
  createProject: (payload: Record<string, unknown>) => request<{ id: string; name: string; status: string }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  processProject: (id: string) => request<{ id: string; status: string; progress: number }>(`/api/projects/${id}/process`, {
    method: 'POST',
  }),
};
