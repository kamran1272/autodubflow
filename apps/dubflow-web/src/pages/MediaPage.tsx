import { ChangeEvent, useMemo, useState } from 'react';
import { FileAudio, FileVideo, Image, Search, UploadCloud } from 'lucide-react';

interface MediaItem {
  id: number;
  name: string;
  type: 'Video' | 'Audio' | 'Image';
  size: string;
  updated: string;
}

const initialMedia: MediaItem[] = [
  { id: 1, name: 'Product Demo Video.mp4', type: 'Video', size: '124 MB', updated: 'Today' },
  { id: 2, name: 'Launch voiceover.wav', type: 'Audio', size: '18 MB', updated: 'Yesterday' },
  { id: 3, name: 'Product thumbnail.png', type: 'Image', size: '2.4 MB', updated: 'Yesterday' },
];

const mediaIcon = { Video: FileVideo, Audio: FileAudio, Image };

export default function MediaPage() {
  const [media, setMedia] = useState(initialMedia);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const visibleMedia = useMemo(() => media.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === 'All' || item.type === filter);
  }), [filter, media, query]);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setMedia((current) => [...files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.type.startsWith('audio/') ? 'Audio' as const : file.type.startsWith('image/') ? 'Image' as const : 'Video' as const,
      size: `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB`,
      updated: 'Just now',
    })), ...current]);
    event.target.value = '';
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Media library</h1><p className="mt-2 max-w-2xl text-muted-foreground">Keep source videos, audio tracks, images, and generated assets available across your projects.</p></div><label className="btn-primary cursor-pointer"><UploadCloud className="mr-2 h-4 w-4" /> Upload media<input className="sr-only" type="file" accept="video/*,audio/*,image/*" multiple onChange={addFiles} /></label></div>
    <div className="card p-4"><div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-3 text-sm" placeholder="Search media" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Video</option><option>Audio</option><option>Image</option></select></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleMedia.map((item) => { const Icon = mediaIcon[item.type]; return <article className="card p-5" key={item.id}><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></span><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.type}</span></div><h2 className="mt-5 truncate font-medium" title={item.name}>{item.name}</h2><p className="mt-2 text-sm text-muted-foreground">{item.size} · {item.updated}</p></article>; })}</div>
    {visibleMedia.length === 0 && <div className="card p-10 text-center text-sm text-muted-foreground">No media matches your search.</div>}
  </div>;
}
