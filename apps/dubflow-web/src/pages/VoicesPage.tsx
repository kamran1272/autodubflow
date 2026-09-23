import { Check, Globe2, Loader2, Mic2, Pause, Play, Search, Sparkles, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Voice = { id: string; name: string; language: string; languageCode: string; country: string; accent: string; gender: 'Female' | 'Male' | 'Neutral'; style: string };
type VoiceProfile = { country: string; language: string; languageCode: string; accent: string; names: [string, string]; };

const profiles: VoiceProfile[] = [
  { country: 'Spain', language: 'Spanish', languageCode: 'es-ES', accent: 'Castilian', names: ['Sofia', 'Mateo'] },
  { country: 'Mexico', language: 'Spanish', languageCode: 'es-MX', accent: 'Mexican', names: ['Valeria', 'Diego'] },
  { country: 'Argentina', language: 'Spanish', languageCode: 'es-AR', accent: 'Rioplatense', names: ['Camila', 'Tomas'] },
  { country: 'United States', language: 'English', languageCode: 'en-US', accent: 'American', names: ['Ava', 'Liam'] },
  { country: 'United Kingdom', language: 'English', languageCode: 'en-GB', accent: 'British', names: ['Emily', 'Oliver'] },
  { country: 'Canada', language: 'English', languageCode: 'en-CA', accent: 'Canadian', names: ['Chloe', 'Noah'] },
  { country: 'France', language: 'French', languageCode: 'fr-FR', accent: 'Parisian', names: ['Claire', 'Louis'] },
  { country: 'Canada', language: 'French', languageCode: 'fr-CA', accent: 'Canadian French', names: ['Amelie', 'Gabriel'] },
  { country: 'Germany', language: 'German', languageCode: 'de-DE', accent: 'Standard German', names: ['Anna', 'Felix'] },
  { country: 'Austria', language: 'German', languageCode: 'de-AT', accent: 'Austrian', names: ['Lea', 'Jonas'] },
  { country: 'Italy', language: 'Italian', languageCode: 'it-IT', accent: 'Italian', names: ['Giulia', 'Marco'] },
  { country: 'Portugal', language: 'Portuguese', languageCode: 'pt-PT', accent: 'European Portuguese', names: ['Ines', 'Rui'] },
  { country: 'Brazil', language: 'Portuguese', languageCode: 'pt-BR', accent: 'Brazilian', names: ['Beatriz', 'Lucas'] },
  { country: 'India', language: 'Hindi', languageCode: 'hi-IN', accent: 'Indian', names: ['Anaya', 'Arjun'] },
  { country: 'Pakistan', language: 'Urdu', languageCode: 'ur-PK', accent: 'Pakistani', names: ['Ayesha', 'Hamza'] },
  { country: 'Bangladesh', language: 'Bengali', languageCode: 'bn-BD', accent: 'Bangladeshi', names: ['Maya', 'Rafi'] },
  { country: 'Sri Lanka', language: 'Sinhala', languageCode: 'si-LK', accent: 'Sri Lankan', names: ['Nimali', 'Dilan'] },
  { country: 'Japan', language: 'Japanese', languageCode: 'ja-JP', accent: 'Standard Japanese', names: ['Yuki', 'Kenji'] },
  { country: 'South Korea', language: 'Korean', languageCode: 'ko-KR', accent: 'Seoul', names: ['Sora', 'Minjun'] },
  { country: 'China', language: 'Mandarin', languageCode: 'zh-CN', accent: 'Mandarin', names: ['Mei', 'Wei'] },
  { country: 'Taiwan', language: 'Mandarin', languageCode: 'zh-TW', accent: 'Taiwanese Mandarin', names: ['Lin', 'Hao'] },
  { country: 'Indonesia', language: 'Indonesian', languageCode: 'id-ID', accent: 'Indonesian', names: ['Putri', 'Bima'] },
  { country: 'Malaysia', language: 'Malay', languageCode: 'ms-MY', accent: 'Malaysian', names: ['Aina', 'Faris'] },
  { country: 'Thailand', language: 'Thai', languageCode: 'th-TH', accent: 'Thai', names: ['Nok', 'Kiet'] },
  { country: 'Vietnam', language: 'Vietnamese', languageCode: 'vi-VN', accent: 'Northern Vietnamese', names: ['Linh', 'Minh'] },
  { country: 'Philippines', language: 'Filipino', languageCode: 'fil-PH', accent: 'Filipino', names: ['Lia', 'Paolo'] },
  { country: 'Turkey', language: 'Turkish', languageCode: 'tr-TR', accent: 'Turkish', names: ['Elif', 'Emre'] },
  { country: 'Saudi Arabia', language: 'Arabic', languageCode: 'ar-SA', accent: 'Gulf Arabic', names: ['Noura', 'Omar'] },
  { country: 'Egypt', language: 'Arabic', languageCode: 'ar-EG', accent: 'Egyptian Arabic', names: ['Mariam', 'Youssef'] },
  { country: 'Israel', language: 'Hebrew', languageCode: 'he-IL', accent: 'Modern Hebrew', names: ['Noa', 'Eitan'] },
  { country: 'Greece', language: 'Greek', languageCode: 'el-GR', accent: 'Greek', names: ['Eleni', 'Nikos'] },
  { country: 'Russia', language: 'Russian', languageCode: 'ru-RU', accent: 'Russian', names: ['Alina', 'Mikhail'] },
  { country: 'Ukraine', language: 'Ukrainian', languageCode: 'uk-UA', accent: 'Ukrainian', names: ['Oksana', 'Taras'] },
  { country: 'Netherlands', language: 'Dutch', languageCode: 'nl-NL', accent: 'Dutch', names: ['Sanne', 'Daan'] },
  { country: 'Sweden', language: 'Swedish', languageCode: 'sv-SE', accent: 'Swedish', names: ['Astrid', 'Erik'] },
  { country: 'Norway', language: 'Norwegian', languageCode: 'nb-NO', accent: 'Norwegian', names: ['Ingrid', 'Lars'] },
  { country: 'Denmark', language: 'Danish', languageCode: 'da-DK', accent: 'Danish', names: ['Freja', 'Mads'] },
  { country: 'Finland', language: 'Finnish', languageCode: 'fi-FI', accent: 'Finnish', names: ['Aino', 'Eero'] },
  { country: 'Poland', language: 'Polish', languageCode: 'pl-PL', accent: 'Polish', names: ['Zofia', 'Jakub'] },
  { country: 'Czech Republic', language: 'Czech', languageCode: 'cs-CZ', accent: 'Czech', names: ['Tereza', 'Jan'] },
  { country: 'South Africa', language: 'English', languageCode: 'en-ZA', accent: 'South African', names: ['Zola', 'Thabo'] },
];

const voiceCatalog: Voice[] = profiles.flatMap((profile, profileIndex) => [
  { id: `${profile.languageCode}-female`, name: profileIndex === 0 ? 'Spanish Neutral' : `${profile.language} ${profile.country}`, language: profile.language, languageCode: profile.languageCode, country: profile.country, accent: profile.accent, gender: 'Female', style: 'Natural' },
  { id: `${profile.languageCode}-male`, name: profileIndex === 0 ? 'Spanish Narrator' : `${profile.language} ${profile.country} Narrator`, language: profile.language, languageCode: profile.languageCode, country: profile.country, accent: profile.accent, gender: 'Male', style: 'Narration' },
  { id: `${profile.languageCode}-pro`, name: profileIndex === 0 ? 'Spanish Professional' : `${profile.language} ${profile.country} Professional`, language: profile.language, languageCode: profile.languageCode, country: profile.country, accent: profile.accent, gender: 'Neutral', style: 'Professional' },
]);

export default function VoicesPage() {
  const [selectedId, setSelectedId] = useState('es-ES-female');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('All languages');
  const [gender, setGender] = useState('All voices');
  const languages = useMemo(() => ['All languages', ...Array.from(new Set(voiceCatalog.map((voice) => voice.language)))], []);
  const visibleVoices = voiceCatalog.filter((voice) => (language === 'All languages' || voice.language === language) && (gender === 'All voices' || voice.gender === gender) && `${voice.name} ${voice.country} ${voice.accent} ${voice.style}`.toLowerCase().includes(query.toLowerCase()));

  function previewVoice(voice: Voice) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (playingId === voice.id) { setPlayingId(null); return; }
    setGeneratingId(voice.id);
    setPlayingId(null);
    window.setTimeout(() => {
      setGeneratingId(null);
      const utterance = new SpeechSynthesisUtterance(`Welcome to VideoForge AI. Preview this ${voice.style.toLowerCase()} ${voice.language} voice.`);
      utterance.lang = voice.languageCode;
      utterance.pitch = voice.gender === 'Female' ? 1.15 : voice.gender === 'Male' ? 0.85 : 1;
      utterance.rate = 0.95;
      utterance.onstart = () => setPlayingId(voice.id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }, 650);
  }

  function selectVoice(voice: Voice) {
    setSelectedId(voice.id);
    localStorage.setItem('videoforge-selected-voice', JSON.stringify(voice));
  }

  return <div className="space-y-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Workspace / Voices</p><h1 className="mt-2 text-3xl font-semibold">Global voice library</h1><p className="mt-2 max-w-2xl text-muted-foreground">Explore {voiceCatalog.length}+ provider-ready voices across languages, countries, and accents.</p></div><Link className="btn-primary" to="/tools/voice"><Sparkles className="mr-2 h-4 w-4" /> Open voice studio</Link></div><div className="card flex flex-col gap-3 p-4 lg:flex-row"><label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-3 text-sm" placeholder="Search voice, country, or accent" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Filter by language">{languages.map((item) => <option key={item}>{item}</option>)}</select><select className="rounded-md border border-border bg-transparent px-3 py-2 text-sm" value={gender} onChange={(event) => setGender(event.target.value)} aria-label="Filter by gender"><option>All voices</option><option>Female</option><option>Male</option><option>Neutral</option></select></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleVoices.map((voice) => { const selected = selectedId === voice.id; const playing = playingId === voice.id; const generating = generatingId === voice.id; return <article className={`card p-5 ${selected ? 'border-primary ring-2 ring-primary/10' : ''}`} key={voice.id}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'}`}><Mic2 className="h-5 w-5" /></span><div><h2 className="font-semibold">{voice.name}</h2><p className="mt-1 text-xs text-muted-foreground">{voice.language} · {voice.country}</p></div></div><button className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary" type="button" onClick={() => previewVoice(voice)} aria-label={`${playing ? 'Stop' : 'Preview'} ${voice.name}`}>{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}</button></div>{generating ? <p className="mt-4 text-xs font-medium text-primary">Generating preview...</p> : playing ? <div className="mt-4 flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />Audio player · Preview playing</div> : <div className="mt-4 h-8 rounded-md bg-muted px-2 py-2"><div className="flex h-full items-center gap-1">{[30, 55, 40, 75, 48, 88, 62, 35, 70, 45].map((height, index) => <span className="w-1 rounded-full bg-primary/40" style={{ height: `${height}%` }} key={index} />)}</div></div>}<div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-md bg-muted p-2"><span className="block text-muted-foreground">Accent</span><span className="mt-1 block font-medium">{voice.accent}</span></div><div className="rounded-md bg-muted p-2"><span className="block text-muted-foreground">Gender</span><span className="mt-1 block font-medium">{voice.gender}</span></div><div className="rounded-md bg-muted p-2"><span className="block text-muted-foreground">Style</span><span className="mt-1 block font-medium">{voice.style}</span></div><div className="rounded-md bg-muted p-2"><span className="block text-muted-foreground">Language</span><span className="mt-1 block font-medium">{voice.language}</span></div></div><button className={`mt-5 flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm font-medium ${selected ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary'}`} type="button" onClick={() => selectVoice(voice)}>{selected && <Check className="mr-2 h-4 w-4" />}{selected ? 'Selected voice' : 'Select voice'}</button></article>; })}</div></div>;
}
