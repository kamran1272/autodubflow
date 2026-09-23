'use client';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, StatusBadge } from '../../components/ui/design-system';

const windows = [
  { label: 'AutoDubFlow ES', rule: 'Next eligible upload', next: 'Today · 18:00 UTC', status: 'Active' },
  { label: 'Product LATAM', rule: 'Weekdays', next: 'Tomorrow · 09:00 UTC', status: 'Active' },
  { label: 'Archive channel', rule: 'Manual approval', next: 'No window', status: 'Paused' },
];

export default function SchedulePage() {
  return <ProtectedRoute><AppShell title="Scheduler" description="Coordinate ready-buffer delivery windows without bypassing quality gates." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Scheduler' }]} actions={<button type="button" className="button primary">Add schedule</button>}><section className="card panel-section"><div className="panel-header"><div><h3>Publishing windows</h3><p>The scheduler selects only READY items for each destination.</p></div><StatusBadge tone="success">Scheduler online</StatusBadge></div><div className="stacked-list">{windows.map((window) => <div key={window.label} className="job-row"><div><strong>{window.label}</strong><small>{window.rule} · next {window.next}</small></div><StatusBadge tone={window.status === 'Active' ? 'success' : 'neutral'}>{window.status}</StatusBadge></div>)}</div></section></AppShell></ProtectedRoute>;
}
