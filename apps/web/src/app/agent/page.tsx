'use client';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, StatusBadge } from '../../components/ui/design-system';

const activity = [
  { time: '12:42', event: 'Detected a new upload from Creator channel', tone: 'info' as const },
  { time: '12:45', event: 'Ingest job accepted by media worker', tone: 'success' as const },
  { time: '12:49', event: 'Waiting for dubbing provider callback', tone: 'warning' as const },
];

export default function AgentPage() {
  return (
    <ProtectedRoute>
      <AppShell title="Agent Workspace" description="Observe the autonomous operator and issue bounded commands." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Agent Workspace' }]}>
        <section className="dashboard-grid">
          <article className="card panel-section">
            <div className="panel-header"><h3>Agent status</h3><StatusBadge tone="success">Observing</StatusBadge></div>
            <div className="stacked-list">
              <div className="list-row"><span>Monitor</span><StatusBadge tone="success">Connected</StatusBadge></div>
              <div className="list-row"><span>Workflow engine</span><StatusBadge tone="success">Ready</StatusBadge></div>
              <div className="list-row"><span>Browser session</span><StatusBadge tone="neutral">Idle</StatusBadge></div>
            </div>
          </article>
          <article className="card panel-section">
            <div className="panel-header"><h3>Agent commands</h3><StatusBadge tone="info">Guarded</StatusBadge></div>
            <div className="stacked-list">
              <button type="button" className="button secondary">Pause intake</button>
              <button type="button" className="button secondary">Retry blocked jobs</button>
              <button type="button" className="button danger">Stop active workflow</button>
            </div>
          </article>
        </section>
        <section className="card panel-section">
          <div className="panel-header"><div><h3>Activity</h3><p>Every decision is recorded before a worker acts.</p></div><StatusBadge tone="info">Live stream</StatusBadge></div>
          <div className="stacked-list">{activity.map((item) => <div key={item.time} className="list-row"><span><strong>{item.time}</strong> {item.event}</span><StatusBadge tone={item.tone}>{item.tone === 'warning' ? 'Waiting' : 'Recorded'}</StatusBadge></div>)}</div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
