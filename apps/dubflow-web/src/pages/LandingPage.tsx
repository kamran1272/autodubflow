import { ArrowRight, AudioLines, Check, FileText, Languages, PlayCircle, Sparkles, Subtitles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const features = [
  'Transcribe, translate and edit in one workspace',
  'Natural AI voices with precise timing controls',
  'Generate subtitles and localized audio tracks',
  'Export polished videos ready to share',
];

const tools = [
  { title: 'Translate & dub', description: 'Localize dialogue with natural voices and preserved timing.', icon: Languages, tone: 'bg-cyan-50 text-cyan-700' },
  { title: 'Transcript studio', description: 'Edit words, speakers and timing before you render.', icon: FileText, tone: 'bg-amber-50 text-amber-700' },
  { title: 'Subtitle maker', description: 'Create, translate and burn in accessible captions.', icon: Subtitles, tone: 'bg-rose-50 text-rose-700' },
  { title: 'Audio workspace', description: 'Replace, mix and balance every track with confidence.', icon: AudioLines, tone: 'bg-emerald-50 text-emerald-700' },
];

export default function LandingPage() {
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState('Sofia · Spanish · Warm');
  const [transcript, setTranscript] = useState('Let’s launch the next big idea.');

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="grid items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI video workspace
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Create, Translate and Dub Videos With AI
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Upload a video, edit its transcript, translate the dialogue, generate natural voices, create subtitles and export the finished video from one AI-powered workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/signup" className="btn-primary">
              Start Creating <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/tools" className="btn-secondary">
              Explore AI Tools
            </Link>
          </div>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="overflow-hidden rounded-xl border border-border bg-slate-900 p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-slate-300">Project / Product launch</span>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" type="button" onClick={() => alert('Your video is ready to export.')}>Export</button>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
                <span>Timeline</span>
                <span>Localized preview</span>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
                  <span>00:00</span>
                  <span>02:34</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div className="h-full w-3/5 rounded-full bg-primary" />
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">English transcript · Scene 04</p>
                    <p className="font-medium">“Let’s launch the next big idea.”</p>
                  </div>
                  <button className="rounded-full bg-primary p-2 text-primary-foreground" type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'Pause preview' : 'Play preview'}>
                    <PlayCircle className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-slate-700"><div className={`h-full rounded-full bg-cyan-300 transition-all ${playing ? 'w-3/4' : 'w-2/5'}`} /></div>
                <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
                  <label className="text-xs text-slate-400">Transcript<input className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-white" value={transcript} onChange={(event) => setTranscript(event.target.value)} /></label>
                  <label className="text-xs text-slate-400">Voice<select className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-white" value={voice} onChange={(event) => setVoice(event.target.value)}><option>Sofia · Spanish · Warm</option><option>Marco · Spanish · Conversational</option><option>Claire · French · Professional</option></select></label>
                </div>
                <div className="mt-6 border-t border-slate-700 pt-4 text-sm text-slate-300">
                  <p className="mb-2">Spanish · AI voice</p>
                  <p className="font-medium text-white">“Llevemos la próxima gran idea al mundo.”</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Everything in one place</p>
          <h2 className="mt-4 text-3xl font-semibold">A toolkit for the whole video workflow</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ title, description, icon: Icon, tone }) => (
            <div key={title} className="card p-5">
              <div className={`mb-5 inline-flex rounded-xl p-3 ${tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
