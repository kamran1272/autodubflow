'use client';

import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, StatusBadge } from '../../components/ui/design-system';

const deliveries = [
  { title: 'Weekly creator roundup', destination: 'AutoDubFlow ES', status: 'Scheduled', detail: 'YouTube · Today 18:00 UTC' },
  { title: 'Product launch teaser', destination: 'Product LATAM', status: 'Ready', detail: 'YouTube · awaiting schedule' },
  { title: 'Investor update dub', destination: 'Content team', status: 'Review', detail: 'QC issue requires approval' },
];

export default function PublishingPage() {
  return <ProtectedRoute><AppShell title="Publishing" description="Deliver approved videos to destination channels through controlled YouTube jobs." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Publishing' }]} actions={<Link href="/schedule" className="button primary">Open scheduler</Link>}><section className="card panel-section"><div className="panel-header"><div><h3>YouTube deliveries</h3><p>Publishing is the final workflow stage and is independently retryable.</p></div><StatusBadge tone="info">YouTube connector</StatusBadge></div><div className="stacked-list">{deliveries.map((delivery) => <article key={delivery.title} className="job-row"><div><strong>{delivery.title}</strong><small>{delivery.destination} · {delivery.detail}</small></div><StatusBadge tone={delivery.status === 'Ready' ? 'success' : delivery.status === 'Review' ? 'warning' : 'info'}>{delivery.status}</StatusBadge></article>)}</div></section></AppShell></ProtectedRoute>;
}
