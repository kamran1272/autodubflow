'use client';

import Link from 'next/link';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, ProgressBar, StatusBadge } from '../../components/ui/design-system';

const jobs = [
  { name: 'Launch campaign localization', stage: 'Dubbing', progress: 72, status: 'Running', owner: 'Spanish channel' },
  { name: 'New product teaser', stage: 'Ingest', progress: 18, status: 'Queued', owner: 'Product channel' },
  { name: 'Investor update dub', stage: 'QC review', progress: 86, status: 'Review', owner: 'Content team' },
];

export default function QueuePage() {
  return (
    <ProtectedRoute>
      <AppShell
        title="Processing Queue"
        description="Monitor deterministic pipeline work and items waiting for review."
        breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Queue' }]}
        actions={<Link href="/automations" className="button primary">Open automations</Link>}
      >
        <section className="card panel-section">
          <div className="panel-header">
            <div>
              <h3>Active work</h3>
              <p>Jobs are executed by workers and advance only through valid workflow events.</p>
            </div>
            <StatusBadge tone="info">3 tracked</StatusBadge>
          </div>
          <div className="stacked-list">
            {jobs.map((job) => (
              <article key={job.name} className="job-row">
                <div>
                  <strong>{job.name}</strong>
                  <small>{job.owner} · {job.stage}</small>
                </div>
                <div className="job-meta">
                  <StatusBadge tone={job.status === 'Running' ? 'info' : job.status === 'Review' ? 'warning' : 'neutral'}>{job.status}</StatusBadge>
                  <ProgressBar value={job.progress} label={`${job.progress}%`} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
