import { ChangeEvent, useMemo, useState } from 'react';
import {
  AudioLines,
  Check,
  Clock3,
  Film,
  Image,
  Languages,
  Music2,
  Play,
  Scissors,
  Settings2,
  Sparkles,
  Subtitles,
  VolumeX,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type VideoToolId = 'trim' | 'extract-audio' | 'replace-audio' | 'add-subtitles' | 'remove-audio' | 'playback-speed' | 'thumbnail';
type OperationType = 'range' | 'audio' | 'subtitles' | 'speed' | 'thumbnail';
type ToolIcon = typeof Scissors;

interface VideoToolDefinition {
  id: VideoToolId;
  name: string;
  description: string;
  icon: ToolIcon;
  operation: OperationType;
  available: boolean;
}

// Add future tools here. The registry keeps navigation, metadata, and capability status in one place.
const videoTools: VideoToolDefinition[] = [
  { id: 'trim', name: 'Trim video', description: 'Keep only the section you need.', icon: Scissors, operation: 'range', available: true },
  { id: 'extract-audio', name: 'Extract audio', description: 'Save the source audio as a separate track.', icon: AudioLines, operation: 'audio', available: true },
  { id: 'replace-audio', name: 'Replace audio', description: 'Swap the current track with a new audio file.', icon: Music2, operation: 'audio', available: true },
  { id: 'add-subtitles', name: 'Add subtitles', description: 'Burn captions into the exported video.', icon: Subtitles, operation: 'subtitles', available: true },
  { id: 'remove-audio', name: 'Remove audio', description: 'Create a silent version of the video.', icon: VolumeX, operation: 'audio', available: true },
  { id: 'playback-speed', name: 'Playback speed', description: 'Make the video faster or slower.', icon: Clock3, operation: 'speed', available: true },
  { id: 'thumbnail', name: 'Generate thumbnail', description: 'Choose a frame for a shareable thumbnail.', icon: Image, operation: 'thumbnail', available: true },
];

const futureTools = ['AI clip generation', 'Silence removal', 'Scene detection', 'Automatic highlights', 'Background removal', 'AI reframing', 'Translation', 'Lip-sync', 'Voice conversion'];

export default function VideoToolsPage() {
  const [selectedId, setSelectedId] = useState<VideoToolId>('trim');
  const [start, setStart] = useState('00:00');
  const [end, setEnd] = useState('02:30');
  const [speed, setSpeed] = useState('1');
  const [subtitleText, setSubtitleText] = useState('');
  const [mediaName, setMediaName] = useState('');
  const [jobStatus, setJobStatus] = useState('Ready to configure');

  const selectedTool = useMemo(() => videoTools.find((tool) => tool.id === selectedId) ?? videoTools[0], [selectedId]);

  function selectTool(id: VideoToolId) {
    setSelectedId(id);
    setJobStatus('Ready to configure');
  }

  function runOperation() {
    if (selectedTool.id === 'trim' && (!start || !end)) {
      setJobStatus('Enter both start and end times.');
      return;
    }
    if (selectedTool.id === 'add-subtitles' && !subtitleText.trim()) {
      setJobStatus('Add subtitle text before continuing.');
      return;
    }
    setJobStatus(`${selectedTool.name} is queued for processing.`);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setMediaName(event.target.files?.[0]?.name ?? '');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground" to="/tools"><span className="mr-2">←</span> Back to AI tools</Link>
          <div className="mt-3 flex items-center gap-3"><span className="rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"><Film className="h-5 w-5" /></span><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Video tools</p><h1 className="text-3xl font-semibold">Edit and process your video</h1></div></div>
          <p className="mt-2 max-w-2xl text-muted-foreground">Apply focused video operations in a project, review the settings, and queue a new result without changing your source media.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground"><Settings2 className="h-4 w-4" /> Extensible processing workspace</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card h-fit p-4">
          <div className="flex items-center gap-2"><WandSparkles className="h-5 w-5 text-primary" /><h2 className="font-semibold">Tool library</h2></div>
          <div className="mt-4 space-y-2">{videoTools.map((tool) => { const Icon = tool.icon; const selected = tool.id === selectedId; return <button key={tool.id} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} type="button" onClick={() => selectTool(tool.id)}><Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{tool.name}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{tool.description}</span></span>{selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}</button>; })}</div>
          <div className="mt-6 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Coming next</p><div className="mt-3 flex flex-wrap gap-2">{futureTools.map((tool) => <span key={tool} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{tool}</span>)}</div></div>
        </aside>

        <main className="min-w-0 space-y-6">
          <section className="card overflow-hidden"><div className="aspect-video bg-slate-950 p-5 text-white sm:p-8"><div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 text-center"><Play className="h-10 w-10 text-cyan-300" /><p className="mt-3 font-medium">Project video preview</p><p className="mt-1 text-sm text-slate-400">Your processed result will appear here after the job completes.</p></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"><div><p className="text-sm font-semibold">{selectedTool.name}</p><p className="mt-1 text-xs text-muted-foreground" aria-live="polite">{jobStatus}</p></div><button className="btn-primary" type="button" onClick={runOperation}><Sparkles className="mr-2 h-4 w-4" /> Queue operation</button></div></section>

          <section className="card p-5"><div className="flex items-start gap-3"><selectedTool.icon className="mt-0.5 h-5 w-5 text-primary" /><div><h2 className="text-lg font-semibold">{selectedTool.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedTool.description}</p></div></div><div className="mt-6">{selectedTool.operation === 'range' && <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm"><span className="mb-2 block font-medium">Start time</span><input className="w-full rounded-md border border-border bg-transparent px-3 py-2" type="text" value={start} onChange={(event) => setStart(event.target.value)} placeholder="00:00" /></label><label className="text-sm"><span className="mb-2 block font-medium">End time</span><input className="w-full rounded-md border border-border bg-transparent px-3 py-2" type="text" value={end} onChange={(event) => setEnd(event.target.value)} placeholder="02:30" /></label></div>}
            {selectedTool.operation === 'audio' && <div className="rounded-lg border border-dashed border-border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{selectedTool.id === 'remove-audio' ? 'The output will contain no audio track.' : selectedTool.id === 'extract-audio' ? 'Create an audio-only file from this video.' : 'Choose a replacement audio file.'}</p><p className="mt-1 text-sm text-muted-foreground">{selectedTool.id === 'replace-audio' ? 'MP3, WAV and M4A files are supported.' : 'The source video remains unchanged.'}</p></div>{selectedTool.id === 'replace-audio' && <label className="btn-secondary cursor-pointer"><span>{mediaName || 'Choose audio'}</span><input className="sr-only" type="file" accept="audio/*" onChange={handleFileChange} /></label>}</div></div>}
            {selectedTool.operation === 'subtitles' && <label className="block text-sm"><span className="mb-2 block font-medium">Subtitle text</span><textarea className="min-h-32 w-full rounded-md border border-border bg-transparent p-3 leading-6" value={subtitleText} onChange={(event) => setSubtitleText(event.target.value)} placeholder="Enter captions or paste a subtitle track…" /><span className="mt-2 block text-xs text-muted-foreground">For timed captions, use the Subtitle Generator tool to create and edit SRT or VTT first.</span></label>}
            {selectedTool.operation === 'speed' && <label className="block max-w-sm text-sm"><span className="mb-2 block font-medium">Playback speed</span><select className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={speed} onChange={(event) => setSpeed(event.target.value)}><option value="0.5">0.5× — Slow</option><option value="0.75">0.75×</option><option value="1">1× — Original</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2× — Fast</option></select></label>}
            {selectedTool.operation === 'thumbnail' && <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div><p className="font-medium">Select the frame at 00:12</p><p className="mt-1 text-sm text-muted-foreground">Thumbnail generation will export a JPG or PNG from the selected frame.</p></div><button className="btn-secondary" type="button" onClick={() => setJobStatus('Thumbnail frame selected at 00:12.')}><Image className="mr-2 h-4 w-4" /> Select frame</button></div>}
          </div></section>

          <section className="card p-5"><div className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /><h2 className="font-semibold">Processing model</h2></div><p className="mt-2 text-sm text-muted-foreground">Each operation creates a queued processing job and preserves the original media. Provider-specific options can be added to the registry without changing this workspace shell.</p><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Source preserved</span><span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Non-destructive output</span></div></section>
        </main>
      </div>
    </div>
  );
}
