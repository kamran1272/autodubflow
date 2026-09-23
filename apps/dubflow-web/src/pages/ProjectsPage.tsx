import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ProjectsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
  });

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold">Your video workspace</h1>
        </div>
        <Link className="btn-primary" to="/projects/new">New project</Link>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading projects…</p> : null}
      {error ? <p className="text-red-500">Unable to load projects.</p> : null}

      <div className="card overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-muted-foreground dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={String(project.id)} className="border-t border-border">
                <td className="px-4 py-4 font-medium">{String(project.name)}</td>
                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{String(project.status)}</span></td>
                <td className="px-4 py-4 text-muted-foreground">{String(project.created ?? 'now')}</td>
                <td className="px-4 py-4">{String(project.duration ?? '0')}</td>
                <td className="px-4 py-4">{String(project.sourceLanguage ?? 'en')} → {String(project.targetLanguage ?? 'es')}</td>
                <td className="px-4 py-4"><Link className="font-medium text-primary hover:underline" to={`/projects/${String(project.id)}`}>Open studio</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
