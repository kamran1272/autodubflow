import { ArrowLeft, Download, Languages, Play, Sparkles, Subtitles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type SubtitleSegment = {
  id: number;
  start: string;
  end: string;
  text: string;
};

const initialSegments: SubtitleSegment[] = [
  { id: 1, start: '00:00:02.000', end: '00:00:05.400', text: 'Welcome to the launch demo.' },
  { id: 2, start: '00:00:05.600', end: '00:00:09.200', text: 'Today we are turning one idea into a story.' },
  { id: 3, start: '00:00:09.400', end: '00:00:13.000', text: 'A story the whole world can hear.' },
];

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

function toSrtTimestamp(timestamp: string) {
  return timestamp.replace('.', ',');
}

function downloadFile(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SubtitleToolPage() {
  const [segments, setSegments] = useState(initialSegments);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [fontSize, setFontSize] = useState('medium');
  const [accentColor, setAccentColor] = useState('white');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function updateSegment(id: number, field: keyof SubtitleSegment, value: string) {
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, [field]: value } : segment));
  }

  function analyzeVideo() {
    setIsAnalyzing(true);
    window.setTimeout(() => setIsAnalyzing(false), 900);
  }

  function exportSrt() {
    const content = segments.map((segment, index) => `${index + 1}\n${toSrtTimestamp(segment.start)} --> ${toSrtTimestamp(segment.end)}\n${segment.text}`).join('\n\n');
    downloadFile(content, 'videoforge-subtitles.srt', 'text/plain;charset=utf-8');
  }

  function exportVtt() {
    const content = `WEBVTT\n\n${segments.map((segment) => `${segment.start} --> ${segment.end}\n${segment.text}`).join('\n\n')}`;
    downloadFile(content, 'videoforge-subtitles.vtt', 'text/vtt;charset=utf-8');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" to="/tools"><ArrowLeft className="h-4 w-4" />AI tools</Link>
          <div className="mt-3 flex items-center gap-3"><span className="rounded-lg bg-rose-100 p-2 text-rose-700"><Subtitles className="h-5 w-5" /></span><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">AI subtitles</p><h1 className="mt-1 text-3xl font-semibold">Caption your video</h1></div></div>
          <p className="mt-2 text-muted-foreground">Transcribe speech, refine timing and export subtitles in the format your audience needs.</p>
        </div>
        <button className="btn-primary" type="button" onClick={analyzeVideo} disabled={isAnalyzing}><Sparkles className="mr-2 h-4 w-4" />{isAnalyzing ? 'Analyzing speech...' : 'Analyze video'}</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-success" />Subtitle preview</div><span className="text-xs text-muted-foreground">English · 3 captions</span></div><div className="flex aspect-video items-end justify-center bg-slate-950 p-8 text-center text-white"><div className={`max-w-xl rounded bg-black/70 px-4 py-2 ${fontSize === 'large' ? 'text-2xl' : fontSize === 'small' ? 'text-sm' : 'text-lg'} ${accentColor === 'yellow' ? 'text-yellow-300' : accentColor === 'cyan' ? 'text-cyan-300' : 'text-white'}`}>{segments[0].text}</div></div><div className="flex items-center gap-3 px-5 py-4"><button className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary" type="button" aria-label="Play subtitle preview"><Play className="h-4 w-4 fill-current" /></button><div className="h-2 flex-1 rounded-full bg-slate-200"><div className="h-full w-[22%] rounded-full bg-primary" /></div><span className="text-xs text-muted-foreground">00:02 / 02:34</span></div></section>

          <section className="card p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Subtitle editor</h2><p className="mt-1 text-sm text-muted-foreground">Edit text and timing for each caption.</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Autosaved</span></div><div className="space-y-3">{segments.map((segment) => <div key={segment.id} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[110px_110px_minmax(0,1fr)]"><input className="rounded border border-border bg-transparent px-2 py-2 text-xs" aria-label={`Start time ${segment.id}`} value={segment.start} onChange={(event) => updateSegment(segment.id, 'start', event.target.value)} /><input className="rounded border border-border bg-transparent px-2 py-2 text-xs" aria-label={`End time ${segment.id}`} value={segment.end} onChange={(event) => updateSegment(segment.id, 'end', event.target.value)} /><input className="rounded border border-border bg-transparent px-2 py-2 text-sm" aria-label={`Subtitle text ${segment.id}`} value={segment.text} onChange={(event) => updateSegment(segment.id, 'text', event.target.value)} /></div>)}</div></section>
        </div>

        <aside className="space-y-6"><section className="card p-5"><div className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /><h2 className="font-semibold">Translate subtitles</h2></div><p className="mt-2 text-sm text-muted-foreground">Create a translated caption track while keeping the original available.</p><label className="mt-5 block text-sm font-medium" htmlFor="subtitle-language">Target language</label><select id="subtitle-language" className="mt-2 w-full rounded-md border border-border bg-transparent px-3 py-2" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{languages.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}</select><button className="btn-secondary mt-4 w-full" type="button"><Languages className="mr-2 h-4 w-4" />Translate track</button></section><section className="card p-5"><h2 className="font-semibold">Subtitle styling</h2><div className="mt-4 space-y-4"><div><label className="mb-2 block text-sm text-muted-foreground" htmlFor="font-size">Text size</label><select id="font-size" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={fontSize} onChange={(event) => setFontSize(event.target.value)}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div><div><p className="mb-2 text-sm text-muted-foreground">Accent color</p><div className="flex gap-2">{['white', 'yellow', 'cyan'].map((color) => <button key={color} className={`h-8 w-8 rounded-full border-2 ${accentColor === color ? 'border-primary' : 'border-transparent'} ${color === 'white' ? 'bg-white shadow' : color === 'yellow' ? 'bg-yellow-300' : 'bg-cyan-300'}`} type="button" aria-label={`${color} subtitle color`} onClick={() => setAccentColor(color)} />)}</div></div></div></section><section className="card p-5"><h2 className="font-semibold">Export captions</h2><p className="mt-2 text-sm text-muted-foreground">Download the current edited track.</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="btn-secondary" type="button" onClick={exportSrt}><Download className="mr-2 h-4 w-4" />SRT</button><button className="btn-secondary" type="button" onClick={exportVtt}><Download className="mr-2 h-4 w-4" />VTT</button></div></section></aside>
      </div>
    </div>
  );
}
