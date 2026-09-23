import { AudioLines, Check, Download, Eye, FileText, Film, History, Languages, ListChecks, Maximize2, Mic2, Pause, Pencil, Play, Redo2, Save, SkipBack, SkipForward, Sparkles, Subtitles, Trash2, Undo2, Volume2, VolumeX, WandSparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const tools = [
  { id: 'dub', label: 'AI dubbing', description: 'Create a localized voice track', icon: Languages },
  { id: 'transcript', label: 'Transcript', description: 'Edit words and timing', icon: FileText },
  { id: 'translate', label: 'Translate', description: 'Edit translated dialogue', icon: Languages },
  { id: 'subtitles', label: 'Subtitles', description: 'Generate translated captions', icon: Subtitles },
  { id: 'voices', label: 'Voices', description: 'Choose a generated voice', icon: Mic2 },
  { id: 'audio', label: 'Audio mix', description: 'Balance and replace tracks', icon: AudioLines },
  { id: 'video', label: 'Video', description: 'Trim and process video', icon: Film },
  { id: 'ai', label: 'AI tools', description: 'Run an AI operation', icon: WandSparkles },
  { id: 'media', label: 'Media', description: 'Manage project assets', icon: AudioLines },
];

const studioToolbar: Array<[string, string, LucideIcon]> = [
  ['media', 'Media', AudioLines],
  ['transcript', 'Transcript', FileText],
  ['translate', 'Translate', Languages],
  ['dub', 'Dub', Languages],
  ['subtitles', 'Subtitles', Subtitles],
  ['voices', 'Voices', Mic2],
  ['audio', 'Audio', AudioLines],
  ['video', 'Video', Film],
  ['ai', 'AI Tools', WandSparkles],
];

const projectSections = [
  { id: 'overview', label: 'Overview', icon: ListChecks },
  { id: 'media', label: 'Media & audio', icon: AudioLines },
  { id: 'transcript', label: 'Transcript', icon: FileText },
  { id: 'translations', label: 'Translations', icon: Languages },
  { id: 'voices', label: 'Voices', icon: WandSparkles },
  { id: 'subtitles', label: 'Subtitles', icon: Subtitles },
  { id: 'jobs', label: 'AI jobs', icon: Sparkles },
  { id: 'versions', label: 'Versions', icon: History },
  { id: 'exports', label: 'Exports', icon: Download },
] as const;

const transcriptSegments = [
  { start: 48, end: 66, speaker: 'Speaker 01', text: 'Welcome to the launch demo.' },
  { start: 66, end: 84, speaker: 'Speaker 01', text: 'Today we are turning one idea into a story.' },
  { start: 84, end: 105, speaker: 'Speaker 02', text: 'A story the whole world can hear.' },
];

interface EditableTranscriptSegment { id: string; start: number; end: number; speaker: string; original: string; translated: string; }

type MediaCategory = 'Original Video' | 'Audio Tracks' | 'Generated Audio' | 'Subtitle Files' | 'Generated Assets';
interface MediaAsset { id: string; name: string; category: MediaCategory; format: string; size: string; url?: string; }

export default function ProjectDetailPage() {
  const { id: routeId, projectId } = useParams();
  const id = projectId || routeId || 'project-1';
  const navigate = useNavigate();
  const location = useLocation();
  const projectState = location.state as { name?: string; sourceLanguage?: string; targetLanguage?: string; fileName?: string; fileUrl?: string } | null;
  const [activeTool, setActiveTool] = useState('dub');
  const [transcript, setTranscript] = useState('Welcome to the launch demo. Today we are turning one idea into a story the whole world can hear.');
  const [isSaved, setIsSaved] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processError, setProcessError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(48);
  const [duration, setDuration] = useState(154);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeSection, setActiveSection] = useState('overview');
  const [translation, setTranslation] = useState('Llevemos la próxima gran idea al mundo.');
  const [selectedVoice, setSelectedVoice] = useState('Sofia · Spanish · Warm');
  const [audioName, setAudioName] = useState('Spanish AI voice · Generated');
  const [subtitleStyle, setSubtitleStyle] = useState('Clean white');
  const [dubbingSource, setDubbingSource] = useState('auto');
  const [dubbingTarget, setDubbingTarget] = useState('es');
  const [dubbingMode, setDubbingMode] = useState('Natural');
  const [dubbingStep, setDubbingStep] = useState(1);
  const [isGeneratingDub, setIsGeneratingDub] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [hasExport, setHasExport] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([
    { id: 'source-video', name: projectState?.fileName || 'Product Demo Video.mp4', category: 'Original Video', format: 'MP4', size: '124 MB', url: projectState?.fileUrl },
    { id: 'source-audio', name: 'Original audio track.wav', category: 'Audio Tracks', format: 'WAV', size: '18 MB' },
    { id: 'generated-audio', name: 'Spanish AI voice.mp3', category: 'Generated Audio', format: 'MP3', size: '12 MB' },
    { id: 'subtitles', name: 'Spanish subtitles.srt', category: 'Subtitle Files', format: 'SRT', size: '24 KB' },
    { id: 'thumbnail', name: 'Product thumbnail.png', category: 'Generated Assets', format: 'PNG', size: '2.4 MB' },
  ]);
  const [editableSegments, setEditableSegments] = useState<EditableTranscriptSegment[]>(transcriptSegments.map((segment, index) => ({ id: `segment-${index}`, start: segment.start, end: segment.end, speaker: segment.speaker, original: segment.text, translated: index === 0 ? 'Bienvenidos a la demostración de lanzamiento.' : index === 1 ? 'Hoy convertimos una idea en una historia.' : 'Una historia que todo el mundo puede escuchar.' })));
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [transcriptDirty, setTranscriptDirty] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (projectState?.fileUrl || !isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => {
        if (time >= duration) {
          setIsPlaying(false);
          return 0;
        }
        return time + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [duration, isPlaying, projectState?.fileUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [muted, playbackRate, volume]);

  async function togglePlayback() {
    if (videoRef.current) {
      if (videoRef.current.paused) await videoRef.current.play();
      else videoRef.current.pause();
      return;
    }
    setIsPlaying((playing) => !playing);
  }

  function seekVideo(value: number) {
    const nextTime = Math.max(0, Math.min(value, duration));
    setCurrentTime(nextTime);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
  }

  function seekBy(seconds: number) {
    seekVideo(currentTime + seconds);
  }

  function changePlaybackRate(rate: number) {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }

  function changeVolume(nextVolume: number) {
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    if (videoRef.current) videoRef.current.volume = nextVolume;
  }

  function formatTime(seconds: number) {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setProcessError('');
    try {
      await api.processProject(id);
    } catch {
      setProcessError('The API is offline. VideoForge will run the local processing simulation instead.');
    } finally {
      navigate(`/projects/${id}/processing`, { state: { ...projectState, local: true } });
      setIsAnalyzing(false);
    }
  }

  function handleRender() {
    setIsRendering(true);
    setWorkspaceNotice('Rendering a new export from the current project version…');
    window.setTimeout(() => {
      setIsRendering(false);
      setHasExport(true);
      setActiveSection('exports');
      setWorkspaceNotice('Export completed and is ready to download.');
    }, 900);
  }

  function handleExport(type: string) {
    setExportOpen(false);
    if (type === 'Export Video') {
      handleRender();
      return;
    }
    setHasExport(true);
    setActiveSection('exports');
    setWorkspaceNotice(`${type} is ready to download.`);
  }

  function addMediaFiles(files: FileList | File[]) {
    const additions = Array.from(files).map((file, index): MediaAsset => ({
      id: `asset-${Date.now()}-${index}`,
      name: file.name,
      category: file.type.startsWith('audio/') ? 'Audio Tracks' : file.type.startsWith('image/') ? 'Generated Assets' : file.name.endsWith('.srt') || file.name.endsWith('.vtt') ? 'Subtitle Files' : 'Original Video',
      format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      url: URL.createObjectURL(file),
    }));
    setMediaAssets((current) => [...additions, ...current]);
    setWorkspaceNotice(`${additions.length} media asset${additions.length === 1 ? '' : 's'} added to this project.`);
  }

  function removeAsset(asset: MediaAsset) {
    if (asset.url) URL.revokeObjectURL(asset.url);
    setMediaAssets((current) => current.filter((item) => item.id !== asset.id));
    setWorkspaceNotice(`${asset.name} removed from the project.`);
  }

  function renameAsset(asset: MediaAsset) {
    const name = window.prompt('Rename asset', asset.name)?.trim();
    if (name) {
      setMediaAssets((current) => current.map((item) => item.id === asset.id ? { ...item, name } : item));
      setWorkspaceNotice('Asset renamed successfully.');
    }
  }

  function previewAsset(asset: MediaAsset) {
    if (asset.url) window.open(asset.url, '_blank', 'noopener,noreferrer');
    else setWorkspaceNotice(`${asset.name} is ready for preview after processing.`);
  }

  function downloadAsset(asset: MediaAsset) {
    if (asset.url) {
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = asset.name;
      link.click();
    } else setWorkspaceNotice(`${asset.name} download is queued.`);
  }

  function updateSegment(id: string, field: keyof EditableTranscriptSegment, value: string) {
    setTranscriptDirty(true);
    setEditableSegments((segments) => segments.map((segment) => segment.id === id ? { ...segment, [field]: field === 'start' || field === 'end' ? Number(value) : value } : segment));
  }

  function splitSegment(id: string) {
    setEditableSegments((segments) => {
      const index = segments.findIndex((segment) => segment.id === id);
      const segment = segments[index];
      if (!segment || segment.original.length < 4) return segments;
      const midpoint = Math.floor((segment.start + segment.end) / 2);
      const words = segment.original.split(' ');
      const splitAt = Math.max(1, Math.floor(words.length / 2));
      const firstText = words.slice(0, splitAt).join(' ');
      const secondText = words.slice(splitAt).join(' ');
      const first = { ...segment, id: `${segment.id}-a`, end: midpoint, original: firstText, translated: `${firstText} (translated)` };
      const second = { ...segment, id: `${segment.id}-b`, start: midpoint, original: secondText, translated: `${secondText} (translated)` };
      return [...segments.slice(0, index), first, second, ...segments.slice(index + 1)];
    });
    setWorkspaceNotice('Transcript segment split.');
  }

  function mergeSegment(id: string) {
    setEditableSegments((segments) => {
      const index = segments.findIndex((segment) => segment.id === id);
      if (index < 0 || index === segments.length - 1) return segments;
      const next = segments[index + 1];
      const current = segments[index];
      const merged = { ...current, end: next.end, original: `${current.original} ${next.original}`, translated: `${current.translated} ${next.translated}` };
      return [...segments.slice(0, index), merged, ...segments.slice(index + 2)];
    });
    setWorkspaceNotice('Transcript segments merged.');
  }

  function translateSegment(id: string) {
    setEditableSegments((segments) => segments.map((segment) => segment.id === id ? { ...segment, translated: `Spanish: ${segment.original}` } : segment));
    setWorkspaceNotice('Translation regenerated for this segment.');
  }

  function saveTranscriptChanges() {
    setTranscriptDirty(false);
    setWorkspaceNotice('Transcript changes saved. AI outputs were not regenerated.');
  }

  function confirmRegeneration(type: 'translation' | 'voice') {
    const confirmed = window.confirm(`Regenerate the ${type} for this transcript? This may use AI credits.`);
    if (confirmed) setWorkspaceNotice(`${type === 'translation' ? 'Translation' : 'Voice'} regeneration queued.`);
  }

  function generateDub() {
    setIsGeneratingDub(true);
    setDubbingStep(6);
    setWorkspaceNotice('Dubbing job queued. Your project will keep the original media unchanged.');
    window.setTimeout(() => setIsGeneratingDub(false), 900);
  }

  const selectedTool = tools.find((tool) => tool.id === activeTool) ?? tools[0];

  return (
    <div className="studio-project space-y-6" data-active-section={activeSection}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link className="hover:text-primary" to="/projects">Projects</Link><span>/</span><span>Product Demo Video</span></div>
          <h1 className="mt-3 text-3xl font-semibold">{projectState?.name || 'Product Demo Video'}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span>{projectState?.sourceLanguage || 'English'} to {projectState?.targetLanguage || 'Spanish'} · 02:34</span><span className="inline-flex items-center gap-1.5 text-success"><span className="h-2 w-2 rounded-full bg-success" />Autosaved</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" onClick={() => setWorkspaceNotice('Undo applied to the current edit.')} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
          <button className="btn-secondary" type="button" onClick={() => setWorkspaceNotice('Redo applied to the current edit.')} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
          <button className="btn-secondary" type="button" onClick={togglePlayback}><Play className="mr-2 h-4 w-4" />Preview</button>
          <button className="btn-secondary" type="button" onClick={() => setIsSaved(true)}>{isSaved ? <Check className="mr-2 h-4 w-4 text-success" /> : <Save className="mr-2 h-4 w-4" />}{isSaved ? 'Saved' : 'Save project'}</button>
          <div className="relative"><button className="btn-primary" type="button" onClick={() => setExportOpen((open) => !open)} aria-expanded={exportOpen}>Export</button>{exportOpen ? <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-white p-2 shadow-lg dark:bg-slate-900"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Export project</p>{['Export Video', 'Export Audio', 'Export Subtitles', 'Export Transcript'].map((option) => <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted" type="button" key={option} onClick={() => handleExport(option)}>{option}</button>)}</div> : null}</div>
        </div>
      </div>
      {processError ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700" role="status">{processError}</p> : null}
      {workspaceNotice ? <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary" role="status">{workspaceNotice}</p> : null}

      <nav className="card flex gap-2 overflow-x-auto p-2" aria-label="Project workspace sections">
        {projectSections.map(({ id: sectionId, label, icon: Icon }) => <button key={sectionId} className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${activeSection === sectionId ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} type="button" onClick={() => setActiveSection(sectionId)}><Icon className="h-4 w-4" />{label}</button>)}
      </nav>

      <div className="studio-layout grid gap-6 xl:grid-cols-[190px_minmax(0,1fr)_320px]">
        <aside className="studio-tool-dock card h-fit p-3 xl:sticky xl:top-4">
          <div className="studio-dock-heading"><span className="studio-dock-mark"><WandSparkles className="h-3.5 w-3.5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Studio</p><p className="text-[11px] text-muted-foreground">Project tools</p></div></div>
          <div className="grid grid-cols-2 gap-2 xl:block xl:space-y-1">
            {studioToolbar.map(([key, label, Icon]) => <button key={key} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${activeTool === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} type="button" onClick={() => { setActiveTool(key); const sectionMap: Record<string, string> = { media: 'media', transcript: 'transcript', translate: 'translations', dub: 'overview', subtitles: 'subtitles', voices: 'voices', audio: 'media', video: 'overview', ai: 'overview' }; setActiveSection(sectionMap[key]); setWorkspaceNotice(`${label} workspace selected.`); }}><Icon className="h-4 w-4" />{label}</button>)}
          </div>
        </aside>
        <div className="studio-center space-y-6">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-success" />Studio preview</div><span className="text-xs text-muted-foreground">Scene 04 of 12</span></div>
            <div className="relative aspect-video overflow-hidden bg-slate-950 text-white">
              {projectState?.fileUrl ? <video ref={videoRef} className="h-full w-full object-contain" src={projectState.fileUrl} muted={muted} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 154)} /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950"><div className="mb-5 rounded-full bg-white/10 p-5"><Languages className="h-10 w-10 text-cyan-300" /></div><p className="font-medium">Studio preview ready</p><p className="mt-2 text-sm text-slate-400">{projectState?.fileName || 'Demo project'} · localized preview</p></div>}
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8"><div className="flex items-center gap-2"><button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:scale-105" type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pause preview' : 'Play preview'}>{isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}</button><button className="text-white/80 hover:text-white" type="button" onClick={() => seekBy(-1 / 30)} aria-label="Previous frame"><SkipBack className="h-4 w-4" /></button><button className="text-white/80 hover:text-white" type="button" onClick={() => seekBy(1 / 30)} aria-label="Next frame"><SkipForward className="h-4 w-4" /></button><span className="ml-1 text-xs text-white/80">{formatTime(currentTime)}</span></div><div className="flex items-center gap-3"><button className="text-white/80 hover:text-white" type="button" onClick={() => changeVolume(muted ? volume || 1 : 0)} aria-label={muted ? 'Unmute preview' : 'Mute preview'}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button><input className="w-20 accent-primary" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={(event) => changeVolume(Number(event.target.value))} aria-label="Volume" /><select className="rounded border border-white/20 bg-slate-900/80 px-2 py-1 text-xs text-white" value={playbackRate} onChange={(event) => changePlaybackRate(Number(event.target.value))} aria-label="Playback speed"><option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select><button className="text-white/80 hover:text-white" type="button" onClick={() => videoRef.current?.requestFullscreen()} aria-label="Fullscreen preview"><Maximize2 className="h-4 w-4" /></button></div></div>
            </div>
            <div className="space-y-3 px-5 py-4"><div className="flex justify-between text-xs text-muted-foreground"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div><input className="h-2 w-full cursor-pointer accent-primary" type="range" min="0" max={duration} step="0.1" value={Math.min(currentTime, duration)} onChange={(event) => seekVideo(Number(event.target.value))} aria-label="Seek video preview" /><div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"><div className="rounded-md bg-cyan-50 px-3 py-2 text-cyan-800">Video · Original</div><div className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">Voice · Spanish AI</div><div className="rounded-md bg-rose-50 px-3 py-2 text-rose-800">Captions · Spanish</div></div></div>
          </section>

          <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Transcript editor</h2><p className="mt-1 text-sm text-muted-foreground">Click a segment to seek the video.</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Autosaved</span></div><textarea className="min-h-28 w-full resize-y rounded-lg border border-border bg-transparent p-3 text-sm leading-6 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" value={transcript} onChange={(event) => setTranscript(event.target.value)} /><div className="mt-4 space-y-2">{transcriptSegments.map((segment) => <button className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm ${currentTime >= segment.start && currentTime <= segment.end ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} type="button" key={segment.start} onClick={() => seekVideo(segment.start)}><span className="w-16 shrink-0 text-xs font-medium text-primary">{formatTime(segment.start)}</span><span className="min-w-0 flex-1 truncate">{segment.text}</span><span className="text-xs text-muted-foreground">{segment.speaker}</span></button>)}</div><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>Speaker 01 · 00:48 - 01:06</span><span>{transcript.length} characters</span></div></section>
          <section className="card overflow-hidden p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Timeline</h2><span className="text-xs text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</span></div><div className="mb-2 flex justify-between pl-16 text-[10px] text-muted-foreground"><span>00:00</span><span>00:51</span><span>01:42</span><span>02:34</span></div><div className="space-y-2"><div className="flex items-center gap-2"><span className="w-14 text-[10px] font-medium text-muted-foreground">VIDEO</span><div className="relative h-7 flex-1 rounded bg-cyan-100"><div className="h-full w-full rounded bg-cyan-200" /><div className="absolute left-[31%] top-0 h-full w-1 bg-primary" /></div></div><div className="flex items-center gap-2"><span className="w-14 text-[10px] font-medium text-muted-foreground">VOICE</span><div className="h-7 flex-1 rounded bg-amber-100"><div className="ml-[20%] h-full w-[65%] rounded bg-amber-300" /></div></div><div className="flex items-center gap-2"><span className="w-14 text-[10px] font-medium text-muted-foreground">CAPTIONS</span><div className="h-7 flex-1 rounded bg-rose-100"><button className="ml-[10%] h-full w-[80%] rounded bg-rose-300 text-left text-[10px] text-rose-900 hover:bg-rose-400" type="button" onClick={() => seekVideo(66)} aria-label="Seek to subtitle segment">Spanish subtitle · 01:06</button></div></div></div></section>
          <section className="card p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Original Audio</h2><span className="text-xs text-muted-foreground">Source track · 02:34</span></div><button className="mt-3 h-7 w-full rounded bg-slate-200 text-left hover:bg-slate-300" type="button" onClick={() => seekVideo(48)} aria-label="Seek original audio track"><span className="ml-[8%] block h-full w-[72%] rounded bg-slate-400" /></button></section>
        </div>

        <aside className="studio-context space-y-6">
          <section className="studio-context-card card p-5"><div className="studio-context-heading"><div className="studio-context-icon"><selectedTool.icon className="h-5 w-5" /></div><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Active workspace</p><h2 className="mt-1 font-semibold">{selectedTool.label}</h2><p className="mt-1 text-xs text-muted-foreground">{selectedTool.description}</p></div></div><div className="studio-tool-list mt-5">{tools.map(({ id: toolId, label, description, icon: Icon }) => (<button key={toolId} type="button" onClick={() => setActiveTool(toolId)} className={`studio-tool-item flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${activeTool === toolId ? 'is-selected border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}><span className="studio-tool-icon"><Icon className={`h-4 w-4 ${activeTool === toolId ? 'text-primary' : 'text-muted-foreground'}`} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block truncate text-[11px] text-muted-foreground">{description}</span></span>{activeTool === toolId && <Check className="h-4 w-4 text-primary" />}</button>))}</div><div className="studio-action-box mt-5"><p className="text-sm font-semibold">{selectedTool.label} controls</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Configure this operation here, then review its result in the project timeline and assets.</p><button className="btn-secondary mt-3 w-full" type="button" onClick={() => { setWorkspaceNotice(`${selectedTool.label} operation applied to this project.`); if (selectedTool.id === 'dub') handleAnalyze(); }}>{selectedTool.id === 'dub' ? 'Run dubbing' : `Apply ${selectedTool.label}`}</button></div><div className="mt-5 grid grid-cols-2 gap-2"><Link className="btn-secondary text-xs" to="/tools">Tool library</Link><button className="btn-primary text-xs" type="button" onClick={handleAnalyze} disabled={isAnalyzing}><Sparkles className="mr-1.5 h-3.5 w-3.5" />{isAnalyzing ? 'Working' : 'Analyze'}</button></div></section>
          <section className="card p-5"><h2 className="font-semibold">Project details</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="font-medium text-success">Studio ready</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Source</dt><dd className="font-medium">English</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Target</dt><dd className="font-medium">Spanish</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Voice</dt><dd className="font-medium">Spanish Neutral</dd></div></dl></section>
        </aside>
      </div>

      {activeTool === 'dub' && <section className="studio-dubbing-panel card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">AI dubbing workflow</p><h2 className="mt-1 text-xl font-semibold">Create a localized voice track</h2><p className="mt-1 text-sm text-muted-foreground">Move through each stage, review the result, then generate the dub.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Step {dubbingStep} of 6</span></div><div className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{['Source', 'Translation', 'Voice', 'Synchronization', 'Preview', 'Generate'].map((step, index) => { const number = index + 1; return <button className={`rounded-lg border p-3 text-left ${dubbingStep === number ? 'border-primary bg-primary/5' : number < dubbingStep ? 'border-success/30 bg-success/5' : 'border-border'}`} type="button" key={step} onClick={() => setDubbingStep(number)}><span className="text-xs font-semibold text-muted-foreground">0{number}</span><span className="mt-2 block text-xs font-medium">{step}</span></button>; })}</div><div className="mt-6 grid gap-5 lg:grid-cols-2"><label className="block text-sm font-medium">Source language<select className="mt-2 w-full rounded-md border border-border bg-transparent px-3 py-2" value={dubbingSource} onChange={(event) => { setDubbingSource(event.target.value); setDubbingStep(1); }}><option value="auto">Auto Detect</option><option value="en">English</option><option value="fr">French</option><option value="de">German</option></select></label><label className="block text-sm font-medium">Target language<select className="mt-2 w-full rounded-md border border-border bg-transparent px-3 py-2" value={dubbingTarget} onChange={(event) => { setDubbingTarget(event.target.value); setDubbingStep(2); }}><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="pt">Portuguese</option><option value="hi">Hindi</option><option value="ja">Japanese</option></select></label><label className="block text-sm font-medium">Voice library<select className="mt-2 w-full rounded-md border border-border bg-transparent px-3 py-2" value={selectedVoice} onChange={(event) => { setSelectedVoice(event.target.value); setDubbingStep(3); }}><option>Sofia · Spanish · Warm</option><option>Marco · Spanish · Conversational</option><option>Claire · French · Professional</option><option>Liam · English · Energetic</option></select></label><label className="block text-sm font-medium">Dubbing mode<select className="mt-2 w-full rounded-md border border-border bg-transparent px-3 py-2" value={dubbingMode} onChange={(event) => { setDubbingMode(event.target.value); setDubbingStep(4); }}><option>Natural</option><option>Precise timing</option><option>Expressive</option></select></label></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-4"><div><p className="text-sm font-semibold">Synchronization and preview</p><p className="mt-1 text-xs text-muted-foreground">{dubbingMode} delivery · {selectedVoice} · Spanish output</p></div><div className="flex gap-2"><button className="btn-secondary text-xs" type="button" onClick={() => { setDubbingStep(5); seekVideo(48); }}>Preview dub</button><button className="btn-primary text-xs" type="button" onClick={generateDub} disabled={isGeneratingDub}>{isGeneratingDub ? 'Generating…' : 'Generate dub'}</button></div></div></section>}

      <section className="studio-entity-panel card p-5">
        {activeSection === 'media' && <div><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Project media</h2><p className="mt-1 text-sm text-muted-foreground">Manage every source and generated asset in this project.</p></div><label className="btn-primary cursor-pointer"><AudioLines className="mr-2 h-4 w-4" /> Upload media<input className="sr-only" type="file" multiple accept="video/*,audio/*,image/*,.srt,.vtt" onChange={(event) => { if (event.target.files) addMediaFiles(event.target.files); event.target.value = ''; }} /></label></div><div className="mt-6 space-y-5">{(['Original Video', 'Audio Tracks', 'Generated Audio', 'Subtitle Files', 'Generated Assets'] as MediaCategory[]).map((category) => <div key={category}><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">{category}</h3><span className="text-xs text-muted-foreground">{mediaAssets.filter((asset) => asset.category === category).length} asset{mediaAssets.filter((asset) => asset.category === category).length === 1 ? '' : 's'}</span></div><div className="space-y-2">{mediaAssets.filter((asset) => asset.category === category).map((asset) => <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3" key={asset.id}><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{asset.name}</p><p className="mt-1 text-xs text-muted-foreground">{asset.format} · {asset.size}</p></div><div className="flex items-center gap-1"><button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" type="button" onClick={() => previewAsset(asset)} aria-label={`Preview ${asset.name}`}><Eye className="h-4 w-4" /></button><button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" type="button" onClick={() => renameAsset(asset)} aria-label={`Rename ${asset.name}`}><Pencil className="h-4 w-4" /></button><button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" type="button" onClick={() => downloadAsset(asset)} aria-label={`Download ${asset.name}`}><Download className="h-4 w-4" /></button><button className="rounded-md p-2 text-red-500 hover:bg-red-50" type="button" onClick={() => removeAsset(asset)} aria-label={`Remove ${asset.name}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div>)}</div></div>}
        {activeSection === 'overview' && <><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Project workspace</h2><p className="mt-1 text-sm text-muted-foreground">Everything generated for this video stays organized here.</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">All changes saved</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{projectSections.slice(1).map(({ id: sectionId, label, icon: Icon }) => <button key={sectionId} className="rounded-lg border border-border p-4 text-left hover:border-primary" type="button" onClick={() => setActiveSection(sectionId)}><Icon className="h-5 w-5 text-primary" /><p className="mt-3 font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{sectionId === 'media' ? '1 video · 1 audio track' : sectionId === 'jobs' ? '1 completed · 0 running' : sectionId === 'exports' ? `${hasExport ? '1' : '0'} available export` : 'Ready to review and edit'}</p></button>)}</div></>}
        {activeSection === 'media' && <div><h2 className="text-xl font-semibold">Original video and audio</h2><p className="mt-1 text-sm text-muted-foreground">Manage source media and generated audio tracks without changing the original file.</p><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-lg border border-border p-4"><p className="text-sm font-medium">Original video</p><p className="mt-2 truncate text-sm text-muted-foreground">{projectState?.fileName || 'Product Demo Video.mp4'}</p><span className="mt-3 inline-block rounded-full bg-cyan-100 px-2 py-1 text-xs text-cyan-700">Source preserved</span></div><label className="cursor-pointer rounded-lg border border-dashed border-primary/40 p-4 hover:bg-primary/5"><p className="text-sm font-medium">Audio track</p><p className="mt-2 truncate text-sm text-muted-foreground">{audioName}</p><span className="mt-3 inline-block text-xs text-primary">Choose replacement audio<input className="sr-only" type="file" accept="audio/*" onChange={(event) => setAudioName(event.target.files?.[0]?.name || audioName)} /></span></label></div></div>}
        {activeSection === 'transcript' && <div><h2 className="text-xl font-semibold">Searchable transcript</h2><p className="mt-1 text-sm text-muted-foreground">Edit text and keep it aligned to the video timeline.</p><textarea className="mt-5 min-h-32 w-full rounded-lg border border-border bg-transparent p-3 text-sm leading-6" value={transcript} onChange={(event) => setTranscript(event.target.value)} /><button className="btn-secondary mt-3" type="button" onClick={() => setWorkspaceNotice('Transcript changes saved to the current project version.')}>Save transcript</button></div>}
        {activeSection === 'translations' && <div><h2 className="text-xl font-semibold">Translation tracks</h2><p className="mt-1 text-sm text-muted-foreground">Edit the Spanish translation before generating the final voice.</p><div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]"><div className="rounded-lg bg-muted p-4 text-sm"><p className="text-muted-foreground">Target language</p><p className="mt-2 font-medium">Spanish</p><p className="mt-4 text-muted-foreground">Style</p><p className="mt-2 font-medium">Natural</p></div><textarea className="min-h-28 rounded-lg border border-border bg-transparent p-3 text-sm leading-6" value={translation} onChange={(event) => setTranslation(event.target.value)} /></div><button className="btn-secondary mt-3" type="button" onClick={() => setWorkspaceNotice('Spanish translation saved.')}>Save translation</button></div>}
        {activeSection === 'voices' && <div><h2 className="text-xl font-semibold">Voice tracks</h2><p className="mt-1 text-sm text-muted-foreground">Choose the voice used for the Spanish dubbed track.</p><div className="mt-5 flex flex-wrap items-end gap-4"><label className="block min-w-64 flex-1 text-sm"><span className="mb-2 block font-medium">Selected voice</span><select className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={selectedVoice} onChange={(event) => setSelectedVoice(event.target.value)}><option>Sofia · Spanish · Warm</option><option>Marco · Spanish · Conversational</option><option>Claire · French · Professional</option></select></label><button className="btn-primary" type="button" onClick={() => setWorkspaceNotice(`${selectedVoice} selected for the next render.`)}>Apply voice</button></div></div>}
        {activeSection === 'subtitles' && <div><h2 className="text-xl font-semibold">Subtitle track</h2><p className="mt-1 text-sm text-muted-foreground">Control the caption track included in the next export.</p><div className="mt-5 flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" /> Include Spanish subtitles</label><label className="text-sm"><span className="mr-2 font-medium">Style</span><select className="rounded-md border border-border bg-transparent px-3 py-2" value={subtitleStyle} onChange={(event) => setSubtitleStyle(event.target.value)}><option>Clean white</option><option>Bold yellow</option><option>High contrast</option></select></label></div><button className="btn-secondary mt-5" type="button" onClick={() => setWorkspaceNotice(`${subtitleStyle} subtitle style saved.`)}>Save subtitle settings</button></div>}
        {activeSection === 'jobs' && <div><h2 className="text-xl font-semibold">AI processing jobs</h2><p className="mt-1 text-sm text-muted-foreground">Track operations created for this project.</p><div className="mt-5 rounded-lg border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Spanish dubbing pipeline</p><p className="mt-1 text-xs text-muted-foreground">Transcript · translation · voice · sync</p></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Completed</span></div></div><button className="btn-primary mt-4" type="button" onClick={handleAnalyze}>Run dubbing again</button></div>}
        {activeSection === 'versions' && <div><h2 className="text-xl font-semibold">Project versions</h2><p className="mt-1 text-sm text-muted-foreground">Return to an earlier set of edits before rendering.</p><div className="mt-5 space-y-3"><div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4"><div><p className="font-medium">Version 1 · Current</p><p className="mt-1 text-xs text-muted-foreground">Transcript and Spanish voice edits · Just now</p></div><Check className="h-5 w-5 text-success" /></div></div><button className="btn-secondary mt-4" type="button" onClick={() => setWorkspaceNotice('New project version saved.')}>Create version</button></div>}
        {activeSection === 'exports' && <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Exports</h2><p className="mt-1 text-sm text-muted-foreground">Rendered files generated from this project.</p></div><button className="btn-primary" type="button" onClick={handleRender} disabled={isRendering}>{isRendering ? 'Rendering…' : 'Render new export'}</button></div><div className="mt-5 rounded-lg border border-border p-4">{hasExport ? <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Product Demo Video · Spanish.mp4</p><p className="mt-1 text-xs text-muted-foreground">1080p · H.264 · Completed just now</p></div><button className="btn-secondary" type="button" onClick={() => setWorkspaceNotice('Download started.') }><Download className="mr-2 h-4 w-4" /> Download</button></div> : <p className="text-sm text-muted-foreground">No exports yet. Render the project to create the first finished video.</p>}</div></div>}
      </section>

      {activeSection === 'translations' && <section className="studio-translation-panel card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Translation workspace</p><h2 className="mt-1 text-xl font-semibold">Review and refine your translation</h2><p className="mt-1 text-sm text-muted-foreground">Edit each translated segment without changing the original transcript.</p></div><button className="btn-primary" type="button" onClick={() => { setWorkspaceNotice('Translation changes saved to this project.'); setTranscriptDirty(false); }}>Save translations</button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-border bg-muted/50 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Source</p><p className="mt-1 font-semibold">English</p></div><div className="rounded-lg border border-primary/20 bg-primary/5 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Target</p><p className="mt-1 font-semibold">Spanish</p></div></div><div className="mt-6 space-y-4">{editableSegments.map((segment) => <article className="rounded-xl border border-border p-4 transition hover:border-primary/40" key={segment.id}><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><button className="text-xs font-semibold text-primary hover:underline" type="button" onClick={() => seekVideo(segment.start)}>{formatTime(segment.start)} - {formatTime(segment.end)} · {segment.speaker}</button><button className="btn-secondary px-3 py-1.5 text-xs" type="button" onClick={() => { translateSegment(segment.id); setWorkspaceNotice('Segment translation regenerated.'); }}>Regenerate</button></div><div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Original</p><div className="min-h-20 rounded-lg bg-muted p-3 text-sm leading-6">{segment.original}</div></div><label className="block"><span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Spanish</span><textarea className="min-h-20 w-full rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" value={segment.translated} onChange={(event) => updateSegment(segment.id, 'translated', event.target.value)} /></label></div></article>)}</div></section>}

      {activeSection === 'transcript' && transcriptDirty && <section className="card flex flex-wrap items-center justify-between gap-4 border-primary/30 bg-primary/5 p-4"><div><p className="text-sm font-semibold">Unsaved transcript changes</p><p className="mt-1 text-xs text-muted-foreground">AI translation and voice output remain unchanged until you explicitly regenerate them.</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" type="button" onClick={saveTranscriptChanges}>Save Changes</button><button className="btn-secondary" type="button" onClick={() => confirmRegeneration('translation')}>Regenerate Translation</button><button className="btn-primary" type="button" onClick={() => confirmRegeneration('voice')}>Regenerate Voice</button></div></section>}

      {activeSection === 'transcript' && <section className="card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Transcript segments</h2><p className="mt-1 text-sm text-muted-foreground">Edit timing, speakers, original dialogue, and translations in place.</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{editableSegments.length} segments</span></div><div className="mt-5 space-y-4">{editableSegments.map((segment, index) => { const editing = editingSegmentId === segment.id; return <article className={`rounded-lg border p-4 ${currentTime >= segment.start && currentTime <= segment.end ? 'border-primary bg-primary/5' : 'border-border'}`} key={segment.id}><div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><button className="font-semibold text-primary hover:underline" type="button" onClick={() => seekVideo(segment.start)}>{formatTime(segment.start)} - {formatTime(segment.end)}</button><span>·</span>{editing ? <input className="w-28 rounded border border-border bg-transparent px-2 py-1" value={segment.speaker} onChange={(event) => updateSegment(segment.id, 'speaker', event.target.value)} /> : <span>{segment.speaker}</span>}</div><div className="mt-3 grid gap-3 lg:grid-cols-2"><label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Original text</span>{editing ? <textarea className="min-h-20 w-full rounded-md border border-border bg-transparent p-2" value={segment.original} onChange={(event) => updateSegment(segment.id, 'original', event.target.value)} /> : <p className="rounded-md bg-muted p-3 leading-6">{segment.original}</p>}</label><label className="block text-sm"><span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Translated text</span>{editing ? <textarea className="min-h-20 w-full rounded-md border border-border bg-transparent p-2" value={segment.translated} onChange={(event) => updateSegment(segment.id, 'translated', event.target.value)} /> : <p className="rounded-md bg-muted p-3 leading-6">{segment.translated}</p>}</label></div>{editing ? <div className="mt-3 grid max-w-sm gap-3 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Start (seconds)<input className="mt-1 w-full rounded border border-border bg-transparent px-2 py-1 text-sm" type="number" min="0" value={segment.start} onChange={(event) => updateSegment(segment.id, 'start', event.target.value)} /></label><label className="text-xs text-muted-foreground">End (seconds)<input className="mt-1 w-full rounded border border-border bg-transparent px-2 py-1 text-sm" type="number" min={segment.start} value={segment.end} onChange={(event) => updateSegment(segment.id, 'end', event.target.value)} /></label></div> : null}<div className="mt-4 flex flex-wrap gap-2"><button className="btn-secondary text-xs" type="button" onClick={() => { setEditingSegmentId(editing ? null : segment.id); setWorkspaceNotice(editing ? 'Segment changes saved.' : 'Editing transcript segment.'); }}>{editing ? 'Save' : 'Edit'}</button><button className="btn-secondary text-xs" type="button" onClick={() => splitSegment(segment.id)}>Split</button><button className="btn-secondary text-xs" type="button" onClick={() => mergeSegment(segment.id)} disabled={index === editableSegments.length - 1}>Merge</button><button className="btn-secondary text-xs" type="button" onClick={() => seekVideo(segment.start)}><Play className="mr-1 h-3 w-3" />Play</button><button className="btn-secondary text-xs" type="button" onClick={() => translateSegment(segment.id)}>Translate</button><button className="btn-secondary text-xs" type="button" onClick={() => { translateSegment(segment.id); setWorkspaceNotice('AI translation regenerated.'); }}>Regenerate</button></div></article>; })}</div></section>}
    </div>
  );
}
