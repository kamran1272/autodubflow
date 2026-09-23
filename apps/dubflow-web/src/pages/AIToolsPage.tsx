import { ArrowRight, AudioLines, Check, FileText, Film, Languages, Mic2, Play, Sparkles, Subtitles, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const sourceLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'ar', name: 'Arabic' },
];

const targetLanguages = sourceLanguages;

const tools = [
  { title: 'AI Dubbing', description: 'Translate dialogue and generate a natural, timed voice track.', icon: Languages, active: true },
  { title: 'Transcript editor', description: 'Review speakers, words and timing before any render.', icon: FileText, active: true, path: '/tools/transcript' },
  { title: 'AI translation', description: 'Translate transcript content with a style that fits your audience.', icon: Languages, active: true, path: '/tools/translation' },
  { title: 'Subtitle generator', description: 'Create accessible captions and translated subtitle files.', icon: Subtitles, active: true, path: '/tools/subtitles' },
  { title: 'AI voice', description: 'Generate speech with selectable voices, accents, styles and controls.', icon: Mic2, active: true, path: '/tools/voice' },
  { title: 'Video tools', description: 'Trim, process, caption and prepare video outputs non-destructively.', icon: Film, active: true, path: '/tools/video' },
  { title: 'Audio mixer', description: 'Replace, balance and blend every track in your project.', icon: AudioLines, active: false },
];

export default function AIToolsPage() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">AI tools</p>
        <h1 className="mt-2 text-3xl font-semibold">Choose a tool for your video</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Every tool works inside a project, so your source media, edits and generated results stay together.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <section className="card overflow-hidden">
          <div className="border-b border-border bg-slate-950 p-6 text-white">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-lg bg-primary p-2"><Languages className="h-5 w-5" /></span><div><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Featured tool</p><h2 className="mt-1 text-2xl font-semibold">AI Dubbing</h2></div></div><Sparkles className="h-5 w-5 text-cyan-300" /></div>
            <p className="mt-6 max-w-xl text-sm leading-6 text-slate-300">Translate spoken dialogue, generate a natural voice in the target language, and keep the new audio aligned to the original edit.</p>
          </div>
          <div className="p-6">
            <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div><label className="mb-2 block text-sm font-medium" htmlFor="source-language">Source language</label><select id="source-language" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>{sourceLanguages.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}</select></div>
              <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
              <div><label className="mb-2 block text-sm font-medium" htmlFor="target-language">Target language</label><select id="target-language" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{targetLanguages.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}</select></div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><div><p className="text-sm font-medium">Ready for {sourceLanguages.find(({ code }) => code === sourceLanguage)?.name} to {targetLanguages.find(({ code }) => code === targetLanguage)?.name}</p><p className="mt-1 text-xs text-muted-foreground">Choose a project to begin generating a localized track.</p></div><Link className="btn-primary" to="/projects/new">Start with a project <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground"><button className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary" type="button" aria-label="Preview generated voice"><Play className="h-4 w-4 fill-current" /></button><span>Preview a natural voice</span></div>
          </div>
        </section>

        <aside className="card p-5"><div className="flex items-center gap-2"><WandSparkles className="h-5 w-5 text-primary" /><h2 className="font-semibold">Tool library</h2></div><div className="mt-5 space-y-2">{tools.map(({ title, description, icon: Icon, active, path }) => <Link key={title} to={path ?? '/tools'} className={`block rounded-lg border p-3 ${active ? 'border-primary bg-primary/5' : 'border-border'}`}><div className="flex items-center gap-3"><Icon className={active ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-muted-foreground'} /><span className="flex-1 text-sm font-medium">{title}</span>{active ? <Check className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">Soon</span>}</div><p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">{description}</p></Link>)}</div></aside>
      </div>
    </div>
  );
}
