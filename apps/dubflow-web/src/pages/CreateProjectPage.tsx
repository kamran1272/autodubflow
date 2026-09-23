import { ArrowRight, CheckCircle2, FileVideo, Loader2, UploadCloud, X } from 'lucide-react';
import { DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const steps = ['Upload', 'Analyze', 'Studio', 'Review', 'Export'];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('Untitled video');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'complete' | 'cancelled'>('idle');
  const uploadController = useRef<AbortController | null>(null);
  const uploadHeartbeat = useRef<number | null>(null);

  useEffect(() => () => {
    uploadController.current?.abort();
    if (uploadHeartbeat.current) window.clearInterval(uploadHeartbeat.current);
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  async function startUpload(selectedFile: File) {
    setError('');
    const isVideo = selectedFile.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(selectedFile.name);
    if (!isVideo) {
      setError('Please choose a video file in MP4, MOV, WebM, MKV, or AVI format.');
      setUploadState('idle');
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setError('This video is larger than the 2 GB upload limit.');
      setUploadState('idle');
      return;
    }
    uploadController.current?.abort();
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    const localPreviewUrl = URL.createObjectURL(selectedFile);
    setFileUrl(localPreviewUrl);
    setUploadProgress(0);
    setUploadState('uploading');
    uploadHeartbeat.current = window.setInterval(() => {
      setUploadProgress((current) => current < 95 ? current + 1 : current);
    }, 500);
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      const uploaded = await api.uploadVideo(selectedFile, setUploadProgress, controller.signal);
      setFileUrl(uploaded.fileUrl);
      setUploadProgress(100);
      setUploadState('complete');
    } catch (uploadError) {
      if ((uploadError as DOMException).name === 'AbortError') return;
      setError('The upload service is unavailable. A local preview is ready; retry when the API is running.');
      setUploadProgress(100);
      setUploadState('complete');
    } finally {
      if (uploadHeartbeat.current) window.clearInterval(uploadHeartbeat.current);
      uploadHeartbeat.current = null;
    }
  }

  function cancelUpload() {
    uploadController.current?.abort();
    uploadController.current = null;
    if (uploadHeartbeat.current) window.clearInterval(uploadHeartbeat.current);
    uploadHeartbeat.current = null;
    setUploadProgress(0);
    setUploadState('cancelled');
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) startUpload(droppedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const project = await api.createProject({ name, sourceLanguage, targetLanguage, fileName, fileUrl });
      navigate(`/app/projects/${project.id}/studio`, { state: { name, sourceLanguage, targetLanguage, fileName, fileUrl } });
    } catch {
      // Keep the studio flow usable when the optional API is not running locally.
      const localProjectId = `local-project-${Date.now()}`;
      setError('The processing service is offline, so a local studio project was created.');
      navigate(`/app/projects/${localProjectId}/studio`, { state: { name, sourceLanguage, targetLanguage, fileName, fileUrl, local: true } });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">New video project</p>
        <h1 className="mt-2 text-3xl font-semibold">Bring a video into your workspace</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Upload once, then keep the project available for transcript edits, AI tools, review and export.</p>
      </div>
      <div className="card p-6">
        <div className="mb-8 flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <span className="text-sm text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center transition ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/40 bg-primary/5 hover:bg-primary/10'}`}
          >
            <input className="sr-only" type="file" accept="video/*,.mkv" onChange={(event) => { const selectedFile = event.target.files?.[0]; if (selectedFile) startUpload(selectedFile); event.target.value = ''; }} />
            {uploadState === 'uploading' ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : uploadState === 'complete' ? <CheckCircle2 className="h-8 w-8 text-success" /> : fileName ? <FileVideo className="h-8 w-8 text-primary" /> : <UploadCloud className="h-8 w-8 text-primary" />}
            <p className="mt-4 text-lg font-medium">{isDragging ? 'Drop your video here' : fileName || 'Upload Video'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Drag and drop or choose a video file</p>
            <span className="mt-5 text-sm font-medium text-primary">Browse files</span>
            {uploadState === 'uploading' ? <div className="mt-5 w-full max-w-xs"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Uploading…</span><span>{uploadProgress}%</span></div><div className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} /></div><button className="mt-3 text-xs text-muted-foreground hover:text-foreground" type="button" onClick={(event) => { event.preventDefault(); cancelUpload(); }}><X className="mr-1 inline h-3 w-3" /> Cancel upload</button></div> : null}
            {uploadState === 'cancelled' ? <button className="mt-4 text-sm font-medium text-primary" type="button" onClick={(event) => { event.preventDefault(); if (file) startUpload(file); }}>Retry upload</button> : null}
          </label>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="project-name">Project name</label>
              <input id="project-name" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="source-language">Source language</label>
              <select id="source-language" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
                <option value="auto">Auto detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="target-language">Target language</label>
              <select id="target-language" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">or</span><label className="btn-secondary cursor-pointer"><UploadCloud className="mr-2 h-4 w-4" /> Import Media<input className="sr-only" type="file" accept="video/*,.mkv" onChange={(event) => { const selectedFile = event.target.files?.[0]; if (selectedFile) startUpload(selectedFile); event.target.value = ''; }} /></label></div>
          <button className="btn-primary" type="submit" disabled={isCreating || uploadState !== 'complete'}>
            {isCreating ? 'Creating project...' : uploadState === 'complete' ? 'Open video studio' : 'Upload a video to continue'}
            {!isCreating && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-amber-600" role="status">{error}</p> : null}
      </div>
    </form>
  );
}
