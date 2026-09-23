import { ArrowRight, Check, Mic2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const voices = [
  { name: 'Sofia', language: 'Spanish', accent: 'Castilian', style: 'Warm and clear' },
  { name: 'Liam', language: 'English', accent: 'American', style: 'Energetic and bright' },
  { name: 'Claire', language: 'French', accent: 'Parisian', style: 'Professional and polished' },
  { name: 'Maya', language: 'Hindi', accent: 'Indian', style: 'Natural and relaxed' },
];

export default function PublicVoicesPage() {
  return <div className="mx-auto max-w-7xl px-6 py-10"><section className="py-12 text-center md:py-20"><span className="mx-auto inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-700"><Mic2 className="mr-2 h-3.5 w-3.5" /> AI voice library</span><h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">Find the voice your story deserves.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Explore expressive AI voices for narration, dubbing, lessons, product videos, and more. Preview a voice before it becomes part of your project.</p><Link className="btn-primary mt-8 inline-flex" to="/signup">Explore voices in your workspace <ArrowRight className="ml-2 h-4 w-4" /></Link></section><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{voices.map((voice) => <article className="card p-5" key={voice.name}><div className="flex items-center justify-between"><span className="rounded-full bg-primary/10 p-3 text-primary"><Mic2 className="h-5 w-5" /></span><button className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary" type="button" aria-label={`Preview ${voice.name}`}><Play className="h-4 w-4 fill-current" /></button></div><h2 className="mt-5 text-lg font-semibold">{voice.name}</h2><p className="mt-1 text-sm text-muted-foreground">{voice.language} · {voice.accent}</p><p className="mt-4 text-sm">{voice.style}</p><div className="mt-5 flex items-center gap-2 text-xs text-success"><Check className="h-4 w-4" /> Preview available</div></article>)}</section></div>;
}
