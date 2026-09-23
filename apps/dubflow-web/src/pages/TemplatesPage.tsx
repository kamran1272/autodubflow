import { useMemo, useState } from 'react';
import { ArrowRight, Check, Clapperboard, GraduationCap, Megaphone, Mic2, Play, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const templates = [
  { id: 'product-demo', name: 'Product demo', category: 'Marketing', description: 'Translate and dub product walkthroughs with clear chapters.', icon: ShoppingBag, duration: '1–5 min' },
  { id: 'social-short', name: 'Social short', category: 'Social', description: 'Create a focused short with captions and a strong opening.', icon: Sparkles, duration: '15–60 sec' },
  { id: 'course-lesson', name: 'Course lesson', category: 'Education', description: 'Prepare accessible lessons with subtitles and voiceover.', icon: GraduationCap, duration: '5–30 min' },
  { id: 'podcast-video', name: 'Podcast video', category: 'Content', description: 'Replace audio, generate a transcript, and export clips.', icon: Mic2, duration: '10–60 min' },
  { id: 'brand-story', name: 'Brand story', category: 'Marketing', description: 'Build a polished multilingual story for your audience.', icon: Megaphone, duration: '2–8 min' },
  { id: 'blank', name: 'Blank project', category: 'Start anywhere', description: 'Choose your own tools and build a workflow from scratch.', icon: Clapperboard, duration: 'Any length' },
];

const categories = ['All', 'Marketing', 'Social', 'Education', 'Content', 'Start anywhere'];

export default function TemplatesPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const visibleTemplates = useMemo(() => templates.filter((template) => (category === 'All' || template.category === category) && `${template.name} ${template.description}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  return <div className="space-y-6">
    <div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Project templates</h1><p className="mt-2 max-w-2xl text-muted-foreground">Start with a proven workflow and customize the tools, languages, and output for your project.</p></div>
    <div className="card p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><label className="relative min-w-0 flex-1 lg:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-3 text-sm" placeholder="Search templates" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="flex flex-wrap gap-2">{categories.map((item) => <button className={`rounded-full px-3 py-1.5 text-sm ${category === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`} type="button" key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleTemplates.map((template) => { const Icon = template.icon; return <article className="card flex flex-col p-5" key={template.id}><div className="flex items-start justify-between"><span className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></span><span className="text-xs text-muted-foreground">{template.duration}</span></div><h2 className="mt-5 text-lg font-semibold">{template.name}</h2><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{template.description}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-success" /> Ready to use</span><Link className="btn-secondary text-sm" to={`/projects/new?template=${template.id}`}>Use template <ArrowRight className="ml-2 h-4 w-4" /></Link></div></article>; })}</div>
    {visibleTemplates.length === 0 && <div className="card p-10 text-center text-sm text-muted-foreground">No templates match your search.</div>}
    <div className="card flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-5 text-white"><div><p className="font-semibold">Need a custom workflow?</p><p className="mt-1 text-sm text-slate-300">Start with a blank project and choose tools as your video develops.</p></div><Link className="btn-primary" to="/projects/new"><Play className="mr-2 h-4 w-4" /> Start blank project</Link></div>
  </div>;
}
