'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadProjects, uploadProject, type Project } from '../../lib/projects';
import { EmptyState, ErrorState, LoadingState, ProgressBar, StatusBadge, useToast } from '../ui/design-system';

const statusTone = (status: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'READY' || status === 'REVIEW' || status === 'INGESTED') return 'success';
  if (status === 'FAILED') return 'danger';
  if (status === 'PROCESSING' || status === 'QUEUED') return 'info';
  return 'neutral';
};

const progressFor = (project: Project) => {
  if (project.status === 'READY' || project.status === 'EXPORTED') return 100;
  if (project.status === 'REVIEW') return 42;
  if (project.status === 'PROCESSING') return 18;
  return 4;
};

export function ProjectWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { pushToast } = useToast();

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setProjects(await loadProjects());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => { void refresh(); }, 2500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await uploadProject(file, file.name.replace(/\.[^.]+$/, ''));
      pushToast({ title: 'Video queued', description: 'The worker will update this project as ingestion completes.', tone: 'success' });
      await refresh();
    } catch (uploadError) {
      pushToast({ title: 'Upload failed', description: uploadError instanceof Error ? uploadError.message : 'Unable to upload video.', tone: 'error' });
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <LoadingState label="Loading projects from the API…" />;
  if (error) return <ErrorState title="Projects unavailable" description={error} action={<button type="button" className="button secondary" onClick={() => void refresh()}>Retry</button>} />;

  return (
    <div className="project-workspace">
      <section className="card upload-panel">
        <div><span className="eyebrow">Real processing test</span><h2>Send one video through ingestion</h2><p>Upload a local video. AutoDubFlow stores it, creates a project, queues ingestion, and refreshes this view from the database.</p></div>
        <label className={`button primary upload-button ${uploading ? 'is-disabled' : ''}`}>
          {uploading ? 'Uploading…' : 'Choose video'}
          <input type="file" accept="video/*" onChange={handleUpload} disabled={uploading} hidden />
        </label>
      </section>

      {projects.length === 0 ? <EmptyState title="No projects yet" description="Choose a video above to create the first real processing job." /> : (
        <section className="project-list" aria-label="Projects">
          {projects.map((project) => {
            const videoStatus = project.sourceVideo?.status ?? project.status;
            return <article className="card project-card" key={project.id}>
              <div className="project-card-header"><div><span className="eyebrow">Project</span><h3>{project.name}</h3><small>{new Date(project.updatedAt).toLocaleString()}</small></div><StatusBadge tone={statusTone(videoStatus)}>{videoStatus}</StatusBadge></div>
              <ProgressBar value={progressFor(project)} label="Processing progress" />
              <div className="project-facts"><span>Project status <strong>{project.status}</strong></span><span>Media <strong>{project.sourceVideo?.media?.status ?? 'pending'}</strong></span><span>Latest stage <strong>{project.sourceVideo?.stageExecutions[0]?.stage ?? 'MEDIA_INGESTION'}</strong></span></div>
            </article>;
          })}
        </section>
      )}
    </div>
  );
}