'use client';

import { useState } from 'react';

import { ProtectedRoute } from '../../../components/auth/protected-route';
import { useAuth } from '../../../components/auth/auth-provider';
import { AppShell, PageHeader, StatusBadge } from '../../../components/ui/design-system';

export default function AccountSettingsPage() {
  const { user, updateProfile, error: authError, setError } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setLocalError('Name cannot be empty.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLocalError('Use a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setSuccess('Profile updated successfully.');
    } catch {
      setLocalError(authError ?? 'Unable to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Account settings"
        description="Manage profile details and workspace access."
        breadcrumbs={[{ label: 'Settings', href: '/settings/account' }, { label: 'Account' }]}
      >
        <div className="settings-grid">
          <section className="card panel-section form-panel">
            <div className="panel-header">
              <h3>Profile</h3>
              <StatusBadge tone="success">Saved securely</StatusBadge>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <label className="field">
                <span>Full name</span>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <label className="field">
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>

              {(localError ?? authError) && <div className="inline-alert danger">{localError ?? authError}</div>}
              {success && <div className="inline-alert success">{success}</div>}

              <div className="form-actions">
                <button type="submit" className="button primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          <aside className="card panel-section side-panel">
            <div className="panel-header">
              <h3>Workspace status</h3>
            </div>
            <div className="stacked-list">
              <div className="list-row">
                <span>Access level</span>
                <StatusBadge tone="success">Admin</StatusBadge>
              </div>
              <div className="list-row">
                <span>Session status</span>
                <StatusBadge tone="info">Active</StatusBadge>
              </div>
              <div className="list-row">
                <span>Last login</span>
                <strong>Today</strong>
              </div>
            </div>
          </aside>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
