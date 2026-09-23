export type ProjectStatus = 'DRAFT' | 'PROCESSING' | 'REVIEW' | 'READY' | 'EXPORTED' | 'FAILED';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  sourceVideo: {
    id: string;
    title: string;
    status: string;
    media: { status: string; format: string | null; durationSeconds: number | null } | null;
    stageExecutions: Array<{ status: string; stage: string }>;
  } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function loadProjects(): Promise<Project[]> {
  const response = await fetch(`${apiUrl}/api/projects`, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load projects.');
  const payload = await response.json() as { projects: Project[] };
  return payload.projects;
}

export async function uploadProject(file: File, name: string): Promise<Project> {
  const response = await fetch(`${apiUrl}/api/projects`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': file.name, 'X-Project-Name': name },
    body: file,
  });
  const payload = await response.json() as { project?: Project; error?: string };
  if (!response.ok || !payload.project) throw new Error(payload.error ?? 'Unable to upload video.');
  return payload.project;
}