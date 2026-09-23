import { ArrowLeft, Check, Clock3, FileText, Languages, Play, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type TranscriptSegment = {
  id: number;
  start: string;
  end: string;
  speaker: string;
  text: string;
  translation: string;
};

const initialSegments: TranscriptSegment[] = [
  { id: 1, start: '00:00:02', end: '00:00:05', speaker: 'Alex', text: 'Welcome to the launch demo.', translation: 'Bienvenidos a la demostración de lanzamiento.' },
  { id: 2, start: '00:00:06', end: '00:00:10', speaker: 'Alex', text: 'Today we are turning one idea into a story.', translation: 'Hoy convertimos una idea en una historia.' },
  { id: 3, start: '00:00:11', end: '00:00:15', speaker: 'Maya', text: 'A story the whole world can hear.', translation: 'Una historia que todo el mundo puede escuchar.' },
  { id: 4, start: '00:00:16', end: '00:00:21', speaker: 'Alex', text: 'Let us make it clear, human and easy to share.', translation: 'Hagámosla clara, humana y fácil de compartir.' },
];

function timestampToSeconds(timestamp: string) {
  const parts = timestamp.split(':').map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
}

export default function TranscriptToolPage() {
  const [segments, setSegments] = useState(initialSegments);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(1);
  const [currentTime, setCurrentTime] = useState(2);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredSegments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return segments;
    return segments.filter((segment) => `${segment.speaker} ${segment.text} ${segment.translation}`.toLowerCase().includes(query));
  }, [search, segments]);

  function updateSegment(id: number, field: keyof TranscriptSegment, value: string) {
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, [field]: value } : segment));
    setSaved(false);
  }

  function seekTo(segment: TranscriptSegment) {
    setActiveId(segment.id);
    setCurrentTime(timestampToSeconds(segment.start));
  }

  function regenerateTranslation() {
    setIsRegenerating(true);
    window.setTimeout(() => {
      setSegments((current) => current.map((segment) => ({ ...segment, translation: `Traducción actualizada: ${segment.text}` })));
      setIsRegenerating(false);
      setSaved(false);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" to="/tools"><ArrowLeft className="h-4 w-4" />AI tools</Link>
          <div className="mt-3 flex items-center gap-3"><span className="rounded-lg bg-amber-100 p-2 text-amber-700"><FileText className="h-5 w-5" /></span><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Transcript studio</p><h1 className="mt-1 text-3xl font-semibold">Edit your transcript</h1></div></div>
          <p className="mt-2 text-muted-foreground">Search every line, adjust timing and speakers, then regenerate the translation.</p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => setSaved(true)}>{saved ? <Check className="mr-2 h-4 w-4 text-success" /> : <Clock3 className="mr-2 h-4 w-4" />}{saved ? 'Saved' : 'Save transcript'}</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)]">
        <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-success" />Video preview</div><span className="text-xs text-muted-foreground">{currentTime}s / 154s</span></div><div className="flex aspect-video items-center justify-center bg-slate-950 text-white"><button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary" type="button" aria-label="Play video"><Play className="ml-1 h-6 w-6 fill-current" /></button></div><div className="px-5 py-4"><div className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((currentTime / 154) * 100, 100)}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">Click any transcript row to seek the video preview.</p></div></section>

        <section className="card flex min-h-[520px] flex-col p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Transcript</h2><p className="mt-1 text-sm text-muted-foreground">{segments.length} segments · English</p></div><button className="btn-primary" type="button" onClick={regenerateTranslation} disabled={isRegenerating}><Sparkles className="mr-2 h-4 w-4" />{isRegenerating ? 'Regenerating...' : 'Regenerate translation'}</button></div><div className="relative mb-4"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-3 text-sm" placeholder="Search transcript, speaker or translation" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">{filteredSegments.map((segment) => <button key={segment.id} className={`block w-full rounded-lg border p-3 text-left transition ${activeId === segment.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`} type="button" onClick={() => seekTo(segment)}><div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-medium text-primary">{segment.start}</span><span>to</span><span>{segment.end}</span><span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">{segment.speaker}</span></div><p className="text-sm font-medium">{segment.text}</p><p className="mt-1 text-sm text-muted-foreground">{segment.translation}</p></button>)}{filteredSegments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transcript matches found.</p>}</div></section>
      </div>

      <section className="card p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Segment editor</h2><p className="mt-1 text-sm text-muted-foreground">Select a row above, then refine its text, speaker and timestamps.</p></div><Languages className="h-5 w-5 text-primary" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{segments.filter((segment) => segment.id === activeId).map((segment) => <div className="contents" key={segment.id}><div><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="segment-start">Start</label><input id="segment-start" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={segment.start} onChange={(event) => updateSegment(segment.id, 'start', event.target.value)} /></div><div><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="segment-end">End</label><input id="segment-end" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={segment.end} onChange={(event) => updateSegment(segment.id, 'end', event.target.value)} /></div><div><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="segment-speaker">Speaker</label><input id="segment-speaker" className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={segment.speaker} onChange={(event) => updateSegment(segment.id, 'speaker', event.target.value)} /></div><div className="md:col-span-2 xl:col-span-1"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="segment-text">Text</label><textarea id="segment-text" className="min-h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={segment.text} onChange={(event) => updateSegment(segment.id, 'text', event.target.value)} /></div></div>)}</div></section>
    </div>
  );
}
