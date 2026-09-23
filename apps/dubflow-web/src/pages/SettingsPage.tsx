const tabs = ['Profile', 'Preferences', 'Notifications', 'Security', 'Usage'];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold">Workspace preferences</h1>
      </div>
      <div className="card p-5">
        <div className="mb-6 flex gap-2">
          {tabs.map((tab, index) => (
            <button key={tab} className={`rounded-md px-3 py-2 text-sm ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-muted-foreground dark:bg-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Default target language</label>
            <select className="w-full rounded-md border border-border bg-transparent px-3 py-2">
              <option>Spanish</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Theme</label>
            <select className="w-full rounded-md border border-border bg-transparent px-3 py-2">
              <option>System</option>
              <option>Dark</option>
              <option>Light</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
