'use client';

import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, StatusBadge } from '../../components/ui/design-system';

const readyItems = [
  { title: 'Weekly creator roundup', channel: 'AutoDubFlow ES', window: 'Today · 18:00 UTC', status: 'Scheduled' },
  { title: 'Product launch teaser', channel: 'Product LATAM', window: 'Tomorrow · 09:00 UTC', status: 'Ready' },
];

export default function ReadyBufferPage() {
  return (
    <ProtectedRoute>
      <AppShell title="Ready Buffer" description="QC-passed videos waiting for their publishing window." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Ready Buffer' }]} actions={<Link href="/publishing" className="button primary">Publishing</Link>}>
        <section className="card panel-section"><div className="panel-header"><div><h3>Delivery candidates</h3><p>Only assets that pass quality control enter this buffer.</p></div><StatusBadge tone="success">2 ready</StatusBadge></div><div className="stacked-list">{readyItems.map((item) => <article key={item.title} className="job-row"><div><strong>{item.title}</strong><small>{item.channel} · {item.window}</small></div><StatusBadge tone={item.status === 'Scheduled' ? 'info' : 'success'}>{item.status}</StatusBadge></article>)}</div></section>
      </AppShell>
    </ProtectedRoute>
  );
}
