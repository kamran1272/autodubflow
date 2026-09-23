'use client';

import { ProtectedRoute } from '../../components/auth/protected-route';
import { AppShell, PageHeader } from '../../components/ui/design-system';
import { ProjectWorkspace } from '../../components/projects/project-workspace';

export default function ProjectsPage() {
  return <ProtectedRoute><AppShell><PageHeader title="Projects" description="Upload and monitor real media processing jobs." breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: 'Projects' }]} /><ProjectWorkspace /></AppShell></ProtectedRoute>;
}