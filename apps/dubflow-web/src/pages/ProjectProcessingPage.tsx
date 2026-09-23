import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const stages = [
  { name: 'Uploading', status: 'done', percent: 100 },
  { name: 'Extracting audio', status: 'done', percent: 100 },
  { name: 'Transcribing', status: 'done', percent: 100 },
  { name: 'Translating', status: 'active', percent: 72 },
  { name: 'Generating localized voice', status: 'pending', percent: 0 },
  { name: 'Synchronizing', status: 'pending', percent: 0 },
  { name: 'Rendering final video', status: 'pending', percent: 0 },
  { name: 'Quality check', status: 'pending', percent: 0 },
];

export default function ProjectProcessingPage() {
  const { id = 'project-1' } = useParams();
  const [progress, setProgress] = useState(42);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 14, 100);
        if (next === 100) {
          setCompleted(true);
          window.clearInterval(timer);
        }
        return next;
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  const currentStage = completed ? 'Complete' : progress < 58 ? 'Transcribing' : progress < 75 ? 'Translating' : progress < 91 ? 'Generating localized voice' : 'Rendering final video';
  const stageRows = stages.map((stage, index) => {
    const stageProgress = Math.min(100, Math.max(0, progress - index * 14));
    return { ...stage, percent: stageProgress, status: stageProgress >= 100 ? 'done' : stageProgress > 0 ? 'active' : 'pending' };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Processing</p>
        <h1 className="mt-2 text-3xl font-semibold">Analyzing your video</h1>
        <p className="mt-2 text-muted-foreground">{completed ? 'Your dubbed video is ready to review and export.' : 'Your project stays available while VideoForge prepares the studio results.'}</p>
      </div>
      <div className="flex justify-between">
        <Link className="btn-secondary" to={`/projects/${id}`}><ArrowLeft className="mr-2 h-4 w-4" />Back to studio</Link>
        <Link className={`btn-primary ${!completed ? 'pointer-events-none opacity-60' : ''}`} to={`/projects/${id}`} aria-disabled={!completed}><CheckCircle2 className="mr-2 h-4 w-4" />{completed ? 'Review results' : 'Processing...'} <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </div>
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{currentStage}</h2>
          <span className="text-sm text-primary">{progress}%</span>
        </div>
          <div className="h-2 rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{completed ? 'All segments processed successfully.' : `Processing your video · ${progress}% complete`}</p>
        <div className="mt-8 space-y-4">
          {stageRows.map((stage) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${stage.status === 'done' ? 'bg-success' : stage.status === 'active' ? 'bg-primary' : 'bg-slate-300'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <span className="text-xs text-muted-foreground">{stage.percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
