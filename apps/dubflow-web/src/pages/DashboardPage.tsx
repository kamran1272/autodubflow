import { ArrowRight, ArrowUpRight, BarChart3, Briefcase, Clock3, Folder, Languages, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Projects', value: '24', detail: '+3 this month' },
  { label: 'Videos Processed', value: '18', detail: '75% completion rate' },
  { label: 'Minutes Used', value: '147', detail: '32 minutes remaining' },
  { label: 'Exports', value: '36', detail: '+8 this month' },
];

const projects = [
  { name: 'Product Demo Video', status: 'Completed', language: 'English → Spanish', duration: '02:34', updated: '2 hours ago' },
  { name: 'Launch Reel', status: 'Processing', language: 'French → Spanish', duration: '01:12', updated: 'In progress' },
  { name: 'Interview Cut', status: 'Queued', language: 'English → Spanish', duration: '04:18', updated: 'Queued' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back, Alex</h1>
          <p className="mt-2 text-muted-foreground">Continue creating, translating, and sharing your videos.</p>
        </div>
        <Link className="btn-primary" to="/projects/new"><Plus className="mr-2 h-4 w-4" /> Create New Project</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail }) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold">{value}</p>
              <ArrowUpRight className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent projects</h2>
            <Link className="text-sm text-primary" to="/projects">View all</Link>
          </div>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.language}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.status}</p>
                  <p className="text-xs text-muted-foreground">{project.duration} · {project.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Usage</h2><Link className="text-sm text-primary" to="/usage">Details</Link></div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm"><span>Minutes used</span><span>147 / 300</span></div>
              <div className="h-2 rounded-full bg-slate-200"><div className="h-full w-[49%] rounded-full bg-primary" /></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Current plan</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <Clock3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Last activity</p>
                <p className="text-xs text-muted-foreground">Spanish dub completed 2h ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles className="h-5 w-5" /></span><h2 className="text-xl font-semibold">AI Tools</h2></div><Link className="text-sm text-primary" to="/tools">View all</Link></div>
          <p className="mt-3 text-sm text-muted-foreground">Jump into the tools that move your project forward.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><Link className="rounded-lg border border-border p-3 hover:border-primary" to="/tools"><Languages className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">AI Dubbing</p><p className="mt-1 text-xs text-muted-foreground">Translate and generate voices</p></Link><Link className="rounded-lg border border-border p-3 hover:border-primary" to="/tools/subtitles"><BarChart3 className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-medium">AI Subtitles</p><p className="mt-1 text-xs text-muted-foreground">Create captions automatically</p></Link></div>
        </div>
        <div className="card p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Recent Activity</h2><Clock3 className="h-5 w-5 text-muted-foreground" /></div><div className="mt-5 space-y-4"><div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-success" /><div><p className="text-sm font-medium">Product Demo exported</p><p className="text-xs text-muted-foreground">Spanish dub · 2 hours ago</p></div></div><div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /><div><p className="text-sm font-medium">Launch Reel is processing</p><p className="text-xs text-muted-foreground">French → Spanish · In progress</p></div></div><div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-amber-500" /><div><p className="text-sm font-medium">Interview transcript updated</p><p className="text-xs text-muted-foreground">Speaker labels edited · Yesterday</p></div></div></div><Link className="mt-5 inline-flex items-center text-sm text-primary" to="/projects">Open projects <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
      </div>
    </div>
  );
}
