import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type StoredAccount = { name: string; email: string; password: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = JSON.parse(localStorage.getItem('videoforge-account') || 'null') as StoredAccount | null;
    if (!account || account.email.toLowerCase() !== email.trim().toLowerCase() || account.password !== password) {
      setError(account ? 'Email or password is incorrect.' : 'Create an account first to continue.');
      return;
    }
    localStorage.setItem('videoforge-session', JSON.stringify({ email: account.email, name: account.name }));
    navigate('/app');
  }

  return <div className="auth-page"><div className="auth-orbit auth-orbit-one" /><div className="auth-orbit auth-orbit-two" /><div className="auth-panel"><div className="auth-intro"><span className="auth-kicker">VIDEO WORKSPACE</span><h1>Bring your next story to life.</h1><p>Translate, dub, caption, and edit every video from one calm, intelligent workspace.</p><div className="auth-stat"><span className="auth-stat-dot" />Your creative workspace is ready</div></div><div className="auth-form card"><div className="mb-8"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-blue-200"><LockKeyhole className="h-5 w-5" /></div><h2 className="text-2xl font-semibold">Welcome back</h2><p className="mt-2 text-sm text-muted-foreground">Sign in to continue creating with VideoForge AI.</p></div><form className="space-y-5" onSubmit={handleSubmit}><label className="block text-sm font-medium">Email<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="auth-input pl-10" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></div></label><label className="block text-sm font-medium">Password<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="auth-input px-10" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><div className="flex justify-end"><Link className="text-sm font-medium text-primary hover:underline" to="/forgot-password">Forgot password?</Link></div>{error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{error}</p>}<button className="btn-primary w-full py-3" type="submit">Log in <ArrowRight className="ml-2 h-4 w-4" /></button></form><p className="mt-6 text-center text-sm text-muted-foreground">New to VideoForge? <Link className="font-semibold text-primary hover:underline" to="/signup">Create an account</Link></p></div></div></div>;
}
