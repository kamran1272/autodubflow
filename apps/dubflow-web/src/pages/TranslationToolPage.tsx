import { ArrowLeft, ArrowRight, Check, FileText, Languages, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type TranslationSegment = {
  id: number;
  source: string;
  translated: string;
};

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'it', label: 'Italian' },
  { code: 'ar', label: 'Arabic' },
];

const styles = ['Natural', 'Literal', 'Conversational', 'Professional', 'Formal'];

const initialSegments: TranslationSegment[] = [
  { id: 1, source: 'Welcome to the launch demo.', translated: 'Bienvenidos a la demostración de lanzamiento.' },
  { id: 2, source: 'Today we are turning one idea into a story.', translated: 'Hoy convertimos una idea en una historia.' },
  { id: 3, source: 'A story the whole world can hear.', translated: 'Una historia que todo el mundo puede escuchar.' },
  { id: 4, source: 'Let us make it clear, human and easy to share.', translated: 'Hagámosla clara, humana y fácil de compartir.' },
];

const stylePrefixes: Record<string, string> = {
  Natural: 'Traducción natural',
  Literal: 'Traducción literal',
  Conversational: 'Versión conversacional',
  Professional: 'Versión profesional',
  Formal: 'Versión formal',
};

export default function TranslationToolPage() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [style, setStyle] = useState('Natural');
  const [segments, setSegments] = useState(initialSegments);
  const [search, setSearch] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredSegments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return segments;
    return segments.filter((segment) => `${segment.source} ${segment.translated}`.toLowerCase().includes(query));
  }, [search, segments]);

  function updateTranslation(id: number, value: string) {
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, translated: value } : segment));
    setSaved(false);
  }

  function translateTranscript() {
    setIsTranslating(true);
    window.setTimeout(() => {
      const target = languages.find(({ code }) => code === targetLanguage)?.label ?? 'target language';
      setSegments((current) => current.map((segment) => ({ ...segment, translated: `${stylePrefixes[style]} (${target}): ${segment.source}` })));
      setIsTranslating(false);
      setSaved(false);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" to="/tools"><ArrowLeft className="h-4 w-4" />AI tools</Link>
          <div className="mt-3 flex items-center gap-3"><span className="rounded-lg bg-cyan-100 p-2 text-cyan-700"><Languages className="h-5 w-5" /></span><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">AI translation</p><h1 className="mt-1 text-3xl font-semibold">Translate your transcript</h1></div></div>
          <p className="mt-2 max-w-2xl text-muted-foreground">Choose a language pair and translation style, then review every result before it moves into dubbing or subtitles.</p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => setSaved(true)}>{saved ? <Check className="mr-2 h-4 w-4 text-success" /> : <FileText className="mr-2 h-4 w-4" />}{saved ? 'Saved' : 'Save translation'}</button>
      </div>

      <section className="card p-5">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
          <div><label className="mb-2 block text-sm font-medium" htmlFor="translation-source">Source language</label><select id="translation-source" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>{languages.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}</select></div>
          <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
          <div><label className="mb-2 block text-sm font-medium" htmlFor="translation-target">Target language</label><select id="translation-target" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{languages.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}</select></div>
          <div><label className="mb-2 block text-sm font-medium" htmlFor="translation-style">Translation style</label><select id="translation-style" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={style} onChange={(event) => setStyle(event.target.value)}>{styles.map((option) => <option key={option}>{option}</option>)}</select></div>
          <button className="btn-primary" type="button" onClick={translateTranscript} disabled={isTranslating}><Sparkles className="mr-2 h-4 w-4" />{isTranslating ? 'Translating...' : 'Translate'}</button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Source transcript</h2><p className="mt-1 text-sm text-muted-foreground">{languages.find(({ code }) => code === sourceLanguage)?.label} · 4 segments</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-muted-foreground dark:bg-slate-800">Read only</span></div><div className="relative mb-4"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-3 text-sm" placeholder="Search source transcript" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="space-y-3">{filteredSegments.map((segment) => <div key={segment.id} className="rounded-lg border border-border p-3"><p className="text-sm leading-6">{segment.source}</p></div>)}{filteredSegments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No matching segments.</p>}</div></section>

        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Translated transcript</h2><p className="mt-1 text-sm text-muted-foreground">{languages.find(({ code }) => code === targetLanguage)?.label} · {style}</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Editable</span></div><div className="mb-4 rounded-lg bg-cyan-50 p-3 text-xs leading-5 text-cyan-900">Review the generated translation before sending it to AI dubbing or subtitle generation.</div><div className="space-y-3">{filteredSegments.map((segment) => <div key={segment.id} className="rounded-lg border border-border p-3"><textarea className="min-h-16 w-full resize-y rounded border border-border bg-transparent px-3 py-2 text-sm leading-6 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" aria-label={`Translation ${segment.id}`} value={segment.translated} onChange={(event) => updateTranslation(segment.id, event.target.value)} /></div>)}{filteredSegments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No matching segments.</p>}</div></section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4"><div><p className="text-sm font-medium">Next step</p><p className="mt-1 text-sm text-muted-foreground">Use this translation as the source for a dubbed voice or translated subtitle track.</p></div><div className="flex gap-3"><Link className="btn-secondary" to="/tools/subtitles">Create subtitles</Link><Link className="btn-primary" to="/projects/new">Start dubbing</Link></div></section>
    </div>
  );
}
