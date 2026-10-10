'use client';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, ProgressBar, StatusBadge } from '../../components/ui/design-system';

const stages = [
  ['Detect', 'Source monitor identifies eligible uploads.', 'Complete'],
  ['Ingest', 'Media is copied into managed storage.', 'Complete'],
  ['Dub', 'Speech is translated and synthesized.', 'Running'],
  ['Reframe', 'Output is adapted for the destination format.', 'Queued'],
  ['Blur / Mask', 'Configured privacy transforms are applied.', 'Queued'],
  ['Transition', 'Cuts and transitions are rendered.', 'Queued'],
  ['Caption', 'Captions are generated and aligned.', 'Queued'],
  ['Render', 'Final delivery asset is assembled.', 'Queued'],
  ['QC', 'Quality gates must pass before buffering.', 'Queued'],
];

export default function PipelinePage() {
  return (
    <ProtectedRoute>
      <AppShell title="Processing Pipeline" description="Deterministic stages for every automatically discovered video." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Pipeline' }]}>
        <section className="card panel-section">
          <div className="panel-header"><div><h3>Current workflow</h3><p>Launch campaign localization · source-video-1042</p></div><StatusBadge tone="info">Dubbing</StatusBadge></div>
          <ProgressBar value={34} label="Overall progress" />
        </section>
        <section className="card panel-section">
          <div className="stacked-list">{stages.map(([name, description, status], index) => <div key={name} className="job-row"><div><strong>{index + 1}. {name}</strong><small>{description}</small></div><StatusBadge tone={status === 'Complete' ? 'success' : status === 'Running' ? 'info' : 'neutral'}>{status}</StatusBadge></div>)}</div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
