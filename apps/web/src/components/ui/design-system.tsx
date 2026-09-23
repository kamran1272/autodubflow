'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../auth/auth-provider';

export type AppShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
};

type ToastTone = 'info' | 'success' | 'warning' | 'error';

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
  { label: 'Automations', href: '/automations' },
  { label: 'Agent Workspace', href: '/agent' },
  { label: 'Queue', href: '/queue' },
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'Ready Buffer', href: '/ready-buffer' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Publishing', href: '/publishing' },
  { label: 'Source Channels', href: '/sources', disabled: true, disabledReason: 'Configure through an automation' },
  { label: 'Destination Channels', href: '/destinations', disabled: true, disabledReason: 'Configure through an automation' },
  { label: 'Templates', href: '/templates', disabled: true, disabledReason: 'Coming soon' },
  { label: 'Notifications', href: '/notifications', disabled: true, disabledReason: 'Coming soon' },
  { label: 'Analytics', href: '/analytics', disabled: true, disabledReason: 'Coming soon' },
  { label: 'Settings', href: '/settings/account' },
];

const commandItems = [
  { label: 'Dashboard', href: '/dashboard', shortcut: 'G D' },
  { label: 'Projects', href: '/projects', shortcut: 'G R' },
  { label: 'Automations', href: '/automations', shortcut: 'G A' },
  { label: 'Agent Workspace', href: '/agent', shortcut: 'G W' },
  { label: 'Queue', href: '/queue', shortcut: 'G Q' },
  { label: 'Pipeline', href: '/pipeline', shortcut: 'G P' },
  { label: 'Ready Buffer', href: '/ready-buffer', shortcut: 'G B' },
  { label: 'Scheduler', href: '/schedule', shortcut: 'G S' },
  { label: 'Publishing', href: '/publishing', shortcut: 'G Y' },
  { label: 'Settings', href: '/settings/account', shortcut: 'G E' },
  { label: 'Open login', href: '/login', shortcut: 'L' },
];

export function StatusBadge({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="progress-block" aria-label={label ?? 'Progress'}>
      {label ? <div className="progress-meta"><span>{label}</span><strong>{safeValue}%</strong></div> : null}
      <div className="progress-track" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
        <span className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">◎</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon">!</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Loading workspace…' }: { label?: string }) {
  return (
    <div className="loading-state" aria-live="polite" aria-busy="true">
      <div className="skeleton-grid">
        <span className="skeleton-card skeleton-wide" />
        <span className="skeleton-card" />
        <span className="skeleton-card" />
        <span className="skeleton-card skeleton-wide" />
      </div>
      <p>{label}</p>
    </div>
  );
}

export function PageHeader({ title, description, breadcrumbs, actions }: { title: string; description?: string; breadcrumbs?: Array<{ label: string; href?: string }>; actions?: ReactNode }) {
  return (
    <header className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.label}-${index}`} className="breadcrumb-item">
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              {index < breadcrumbs.length - 1 ? <span className="breadcrumb-separator">/</span> : null}
            </div>
          ))}
        </nav>
      ) : null}

      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }:{
  open: boolean; title: string; description: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void | Promise<void>; onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h3 id="confirm-dialog-title">{title}</h3>
        <p>{description}</p>
        <div className="dialog-actions">
          <button type="button" className="button secondary" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="button danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="brand-block">
        <div className="brand-mark">A</div>
        <div>
          <div className="brand-name">AutoDubFlow</div>
          <small>Ops Console</small>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/settings/account' && pathname.startsWith(item.href));

          if (item.disabled) {
            return (
              <button key={item.label} type="button" className={`nav-item ${isActive ? 'active' : ''}`} title={item.disabledReason} aria-disabled="true" disabled>
                <span className="nav-icon">•</span>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">•</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <StatusBadge tone="success">System healthy</StatusBadge>
      </div>
    </aside>
  );
}

function AppTopbar({ onCommandPaletteOpen }: { onCommandPaletteOpen: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('autodubflow-theme') : 'dark';
    const nextTheme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('autodubflow-theme', theme);
    }
  }, [theme]);

  const filteredSearch = useMemo(() => {
    if (!searchValue.trim()) return commandItems;
    return commandItems.filter((item) => item.label.toLowerCase().includes(searchValue.trim().toLowerCase()));
  }, [searchValue]);

  const initials = (user?.name ?? user?.email ?? 'Operator')
    .split(' ')
    .slice(0, 2)
    .map((value) => value.charAt(0)?.toUpperCase() ?? '')
    .join('') || 'O';

  return (
    <header className="topbar">
      <div className="topbar-search-wrap">
        <input type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} onFocus={onCommandPaletteOpen} aria-label="Global search" placeholder="Search workspace" />
        <button type="button" className="shortcut-button" onClick={onCommandPaletteOpen}>⌘K</button>
      </div>

      {searchValue && filteredSearch.length > 0 ? (
        <div className="search-panel" role="listbox" aria-label="Search results">
          {filteredSearch.map((item) => (
            <button key={item.href} type="button" className="search-panel-item" onClick={() => { setSearchValue(''); router.push(item.href); }}>
              <span>{item.label}</span>
              <small>{item.shortcut}</small>
            </button>
          ))}
        </div>
      ) : null}

      <div className="topbar-actions">
        <button type="button" className="icon-button" aria-label="Toggle theme" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>{theme === 'dark' ? '☀' : '☾'}</button>

        <div className="context-menu">
          <button type="button" className="icon-button" aria-label="Notifications" onClick={() => setNotifyOpen((current) => !current)}>🔔</button>
          {notifyOpen ? (
            <div className="menu-panel" role="menu" aria-label="Notifications">
              <div className="menu-item" role="menuitem"><strong>Queue heartbeat stable</strong><span>All active jobs running within SLA.</span><StatusBadge tone="success">healthy</StatusBadge></div>
              <div className="menu-item" role="menuitem"><strong>Storage nearing threshold</strong><span>Project archive is at 82% usage.</span><StatusBadge tone="warning">review</StatusBadge></div>
            </div>
          ) : null}
        </div>

        <div className="context-menu">
          <button type="button" className="user-button" onClick={() => setMenuOpen((current) => !current)} aria-label="User menu">
            <span className="user-avatar">{initials}</span>
            <span className="user-meta"><strong>{user?.name ?? 'Operator'}</strong><small>{pathname}</small></span>
          </button>
          {menuOpen ? (
            <div className="menu-panel" role="menu" aria-label="User menu">
              <Link href="/settings/account" className="menu-item" role="menuitem"><strong>Profile</strong><span>Manage account</span></Link>
              <Link href="/dashboard" className="menu-item" role="menuitem"><strong>Overview</strong><span>Return to dashboard</span></Link>
              <button type="button" className="menu-button" onClick={async () => { await signOut(); router.push('/login'); }}>Sign out</button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return commandItems;
    return commandItems.filter((item) => item.label.toLowerCase().includes(term));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(event) => event.stopPropagation()}>
        <div className="command-header"><span>Command palette</span><button type="button" className="button secondary" onClick={onClose}>Esc</button></div>
        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actions or pages" autoFocus aria-label="Search commands" />
        <div className="command-list" role="listbox">
          {filtered.length === 0 ? <div className="command-empty">No commands found.</div> : filtered.map((item) => (
            <button key={item.href} type="button" className="command-item" onClick={() => { router.push(item.href); onClose(); }}>
              <span>{item.label}</span>
              <small>{item.shortcut}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          <div>
            <strong>{toast.title}</strong>
            {toast.description ? <span>{toast.description}</span> : null}
          </div>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label={`Dismiss ${toast.title}`}>×</button>
        </div>
      ))}
    </div>
  );
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toasts, pushToast, dismissToast }), [dismissToast, pushToast, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function AppShell({ children, title, description, breadcrumbs, actions }: AppShellProps) {
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar pathname={pathname} />
        <div className="shell-main">
          <AppTopbar onCommandPaletteOpen={() => setCommandPaletteOpen(true)} />
          <main className="page-body">
            {title || description || breadcrumbs || actions ? <PageHeader title={title ?? 'Overview'} description={description} breadcrumbs={breadcrumbs} actions={actions} /> : null}
            {children}
          </main>
        </div>
        <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
