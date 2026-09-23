'use client';

import Link from 'next/link';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { useAuth } from '../../components/auth/auth-provider';
import { AppShell, PageHeader, ProgressBar, StatusBadge } from '../../components/ui/design-system';

const recentJobs = [
  { title: 'Launch campaign localization', status: 'Running', progress: 72, owner: 'Ops team' },
  { title: 'New product teaser', status: 'Queued', progress: 18, owner: 'Marketing' },
  { title: 'Investor update dub', status: 'Review', progress: 86, owner: 'Content' },
];

const alerts = [
  { label: 'Source channel sync', value: 'Healthy', tone: 'success' as const },
  { label: 'Destination channels', value: '2 flagged', tone: 'warning' as const },
  { label: 'Publishing queue', value: 'Stable', tone: 'info' as const },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <AppShell
        title="Dashboard"
        description="Operational overview for your localization workflow."
        breadcrumbs={[{ label: 'Overview' }]}
        actions={
          <>
            <Link href="/automations" className="button primary">
              New automation
            </Link>
            <Link href="/queue" className="button secondary">
              View queue
            </Link>
          </>
        }
      >
        <section className="card panel-section large-panel">
          <div className="panel-header"><div><h3>Real media workspace</h3><p>Upload one video and watch the API and worker update its persisted processing state.</p></div><Link href="/projects" className="button primary">Open projects</Link></div>
        </section>

        <section className="dashboard-grid">
          <article className="card panel-section">
            <div className="panel-header">
              <h3>Pipeline health</h3>
              <StatusBadge tone="success">Operational</StatusBadge>
            </div>
            <div className="stacked-list">
              {alerts.map((alert) => (
                <div key={alert.label} className="list-row">
                  <span>{alert.label}</span>
                  <StatusBadge tone={alert.tone}>{alert.value}</StatusBadge>
                </div>
              ))}
            </div>
          </article>

          <article className="card panel-section">
            <div className="panel-header">
              <h3>Recent jobs</h3>
              <Link href="/queue" className="text-link">Open queue</Link>
            </div>
            <div className="stacked-list">
              {recentJobs.map((job) => (
                <div key={job.title} className="job-row">
                  <div>
                    <strong>{job.title}</strong>
                    <small>{job.owner}</small>
                  </div>
                  <div className="job-meta">
                    <StatusBadge tone={job.status === 'Running' ? 'info' : job.status === 'Review' ? 'warning' : 'neutral'}>{job.status}</StatusBadge>
                    <ProgressBar value={job.progress} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="card panel-section large-panel">
          <div className="panel-header">
            <div>
              <h3>Welcome to AutoDubFlow</h3>
              <p>Hi {user?.name ?? user?.email ?? 'Operator'}, your workspace is ready.</p>
            </div>
            <Link href="/settings/account" className="button secondary">
              Account settings
            </Link>
          </div>
          <div className="overview-grid">
            <div className="overview-card">
              <h4>Automation summary</h4>
              <p>24 jobs in active rotation with 3 items flagged for review.</p>
            </div>
            <div className="overview-card">
              <h4>Queue summary</h4>
              <p>8 queued items, 72% of assets are processing normally.</p>
            </div>
            <div className="overview-card">
              <h4>Delivery health</h4>
              <p>Latency remains within SLA and no critical incidents are active.</p>
            </div>
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
