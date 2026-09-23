import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Clapperboard, Folder, Image, LayoutDashboard, LayoutTemplate, Mic, Settings, Sparkles, UserCircle2, UploadCloud } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/tools', label: 'AI Tools', icon: Sparkles },
  { to: '/media', label: 'Media', icon: Image },
  { to: '/workspace/voices', label: 'Voices', icon: Mic },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/usage', label: 'Usage', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden lg:flex-row">
        <aside className="workspace-sidebar w-full shrink-0 border-b border-border bg-white p-4 dark:bg-slate-900 lg:h-screen lg:w-72 lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:p-5">
          <div className="mb-5 flex items-center justify-between lg:mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Clapperboard className="h-4 w-4" />
                </span>
                <p className="text-lg font-semibold tracking-tight">VideoForge <span className="text-primary">AI</span></p>
              </div>
              <h1 className="mt-3 text-xl font-semibold lg:mt-7 lg:text-2xl">Workspace</h1>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `workspace-nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-blue-200' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'} `
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <Link className="btn-primary mt-4 flex w-full justify-center" to="/projects/new"><UploadCloud className="mr-2 h-4 w-4" /> Create project</Link>

          <div className="mt-5 hidden border-t border-border pt-5 lg:block">
            <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <UserCircle2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Alex Morgan</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
              Logout
            </button>
          </div>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 p-4 sm:p-6 lg:h-screen lg:overflow-y-auto lg:overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
