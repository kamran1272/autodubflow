'use client';

import Link from 'next/link';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, StatusBadge } from '../../components/ui/design-system';

const automations = [
  { name: 'Spanish channel localization', source: 'Creator channel', destination: 'AutoDubFlow ES', language: 'Spanish', schedule: 'Every new upload', status: 'Active' },
  { name: 'Product launch pipeline', source: 'Product channel', destination: 'Product LATAM', language: 'Portuguese', schedule: 'Weekdays at 09:00', status: 'Paused' },
];

export default function AutomationsPage() {
  return (
    <ProtectedRoute>
      <AppShell
        title="Automation Center"
        description="Define how new source videos move from detection to publication."
        breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Automations' }]}
        actions={<button type="button" className="button primary">New automation</button>}
      >
        <section className="card panel-section">
          <div className="panel-header">
            <div>
              <h3>Autonomous workflows</h3>
              <p>Each automation watches a source channel and applies its processing and publishing rules.</p>
            </div>
            <StatusBadge tone="success">Agent ready</StatusBadge>
          </div>
          <div className="stacked-list">
            {automations.map((automation) => (
              <article key={automation.name} className="job-row">
                <div>
                  <strong>{automation.name}</strong>
                  <small>{automation.source} to {automation.destination}</small>
                </div>
                <div className="job-meta">
                  <span>{automation.language}</span>
                  <span>{automation.schedule}</span>
                  <StatusBadge tone={automation.status === 'Active' ? 'success' : 'neutral'}>{automation.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="card panel-section">
            <h3>Pipeline rules</h3>
            <div className="stacked-list">
              <div className="list-row"><span>Detect new uploads</span><StatusBadge tone="success">Enabled</StatusBadge></div>
              <div className="list-row"><span>Run dubbing and captions</span><StatusBadge tone="success">Enabled</StatusBadge></div>
              <div className="list-row"><span>Hold until QC passes</span><StatusBadge tone="success">Required</StatusBadge></div>
            </div>
          </article>
          <article className="card panel-section">
            <h3>Next step</h3>
            <p>Connect a source and destination channel to activate autonomous processing.</p>
            <Link href="/settings/account" className="button secondary">Configure workspace</Link>
          </article>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
