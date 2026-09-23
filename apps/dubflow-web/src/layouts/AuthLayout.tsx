import { Clapperboard } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="public-header border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clapperboard className="h-4 w-4" />
            </span>
            VideoForge <span className="text-primary">AI</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground sm:gap-5">
            <Link className="hidden md:inline" to="/features">Product</Link>
            <Link className="hidden lg:inline" to="/ai-dubbing">AI Dubbing</Link>
            <Link className="hidden lg:inline" to="/ai-subtitles">Subtitles</Link>
            <Link className="hidden xl:inline" to="/ai-translation">Translation</Link>
            <Link className="hidden xl:inline" to="/voices">Voices</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login" className="btn-secondary">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary">
              Start Creating
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-border bg-white/70 px-6 py-10 backdrop-blur dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-sm text-muted-foreground">
          <p>© 2026 VideoForge AI</p>
          <div className="flex flex-wrap gap-5"><Link className="hover:text-primary" to="/about">About</Link><Link className="hover:text-primary" to="/contact">Contact</Link><Link className="hover:text-primary" to="/pricing">Pricing</Link><Link className="hover:text-primary" to="/login">Log in</Link></div>
        </div>
      </footer>
    </div>
  );
}
