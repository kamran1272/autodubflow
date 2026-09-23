import { useMemo, useState } from 'react';
import { AudioLines, Check, Play, RotateCcw, Square, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Voice {
  id: string;
  name: string;
  language: string;
  languageCode: string;
  accent: string;
  gender: string;
  style: string;
  description: string;
}

const voices: Voice[] = [
  { id: 'sofia', name: 'Sofia', language: 'Spanish', languageCode: 'es-ES', accent: 'Castilian', gender: 'Female', style: 'Warm', description: 'Clear and expressive for explainers and tutorials.' },
  { id: 'marco', name: 'Marco', language: 'Spanish', languageCode: 'es-MX', accent: 'Mexican', gender: 'Male', style: 'Conversational', description: 'Friendly, natural delivery for social and marketing videos.' },
  { id: 'claire', name: 'Claire', language: 'French', languageCode: 'fr-FR', accent: 'Parisian', gender: 'Female', style: 'Professional', description: 'Polished narration with a confident presence.' },
  { id: 'liam', name: 'Liam', language: 'English', languageCode: 'en-US', accent: 'American', gender: 'Male', style: 'Energetic', description: 'Bright and engaging for product and creator content.' },
  { id: 'maya', name: 'Maya', language: 'Hindi', languageCode: 'hi-IN', accent: 'Indian', gender: 'Female', style: 'Natural', description: 'Relaxed and articulate for educational content.' },
  { id: 'kenji', name: 'Kenji', language: 'Japanese', languageCode: 'ja-JP', accent: 'Standard', gender: 'Male', style: 'Calm', description: 'Measured and precise for documentaries and guides.' },
];

const languageOptions = ['All languages', 'English', 'Spanish', 'French', 'Hindi', 'Japanese'];
const toneOptions = ['Provider default', 'Calm', 'Bright', 'Serious', 'Warm'];

export default function VoiceToolPage() {
  const [selectedVoiceId, setSelectedVoiceId] = useState('sofia');
  const [languageFilter, setLanguageFilter] = useState('All languages');
  const [text, setText] = useState('Welcome to VideoForge AI. Create, translate, and share your story with a voice that feels natural.');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [tone, setTone] = useState('Provider default');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('Ready to generate');

  const filteredVoices = useMemo(
    () => languageFilter === 'All languages' ? voices : voices.filter((voice) => voice.language === languageFilter),
    [languageFilter],
  );
  const selectedVoice = voices.find((voice) => voice.id === selectedVoiceId) ?? voices[0];

  function previewVoice(voice: Voice = selectedVoice) {
    if (!('speechSynthesis' in window)) {
      setStatus('Speech preview is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text || 'Preview this voice in VideoForge AI.');
    utterance.lang = voice.languageCode;
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus(`Previewing ${voice.name}`);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus('Preview complete');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus('Unable to play this preview.');
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopPreview() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStatus('Preview stopped');
  }

  function generateSpeech() {
    setStatus(`Generating ${selectedVoice.name}'s ${tone.toLowerCase()} voice track…`);
    previewVoice();
  }

  function resetControls() {
    setSpeed(1);
    setPitch(1);
    setTone('Provider default');
    setStatus('Voice settings reset');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground" to="/tools">
            <span className="mr-2">←</span> Back to AI tools
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><AudioLines className="h-5 w-5" /></span>
            <div><p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">AI voice</p><h1 className="text-3xl font-semibold">Generate speech from text</h1></div>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">Choose a voice, shape its delivery, and preview a natural speech track before adding it to your project.</p>
        </div>
        <button className="btn-primary" type="button" onClick={generateSpeech}><WandSparkles className="mr-2 h-4 w-4" /> Generate speech</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <section className="card min-w-0 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Voice library</h2><p className="mt-1 text-sm text-muted-foreground">Browse voices by language and select one for your track.</p></div>
            <select className="rounded-md border border-border bg-transparent px-3 py-2 text-sm" aria-label="Filter voices by language" value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
              {languageOptions.map((language) => <option key={language}>{language}</option>)}
            </select>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {filteredVoices.map((voice) => {
              const selected = voice.id === selectedVoice.id;
              return <article key={voice.id} className={`rounded-lg border p-4 transition ${selected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-start justify-between gap-3"><button className="min-w-0 text-left" type="button" onClick={() => setSelectedVoiceId(voice.id)}><h3 className="truncate font-semibold">{voice.name}</h3><p className="mt-1 text-xs text-muted-foreground">{voice.language} · {voice.accent}</p></button><button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:border-primary hover:text-primary" type="button" onClick={() => previewVoice(voice)} aria-label={`Preview ${voice.name}`}><Play className="h-3.5 w-3.5 fill-current" /></button></div>
                <p className="mt-3 text-sm leading-5 text-muted-foreground">{voice.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-2 py-1">{voice.gender}</span><span className="rounded-full bg-muted px-2 py-1">{voice.style}</span></div>
                <button className={`mt-4 flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm ${selected ? 'border-primary text-primary' : 'border-border hover:border-primary'}`} type="button" onClick={() => setSelectedVoiceId(voice.id)}>{selected && <Check className="mr-2 h-4 w-4" />} {selected ? 'Selected voice' : 'Use this voice'}</button>
              </article>;
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Voice settings</h2><p className="mt-1 text-sm text-muted-foreground">{selectedVoice.name} · {selectedVoice.language}</p></div><button className="text-muted-foreground hover:text-foreground" type="button" onClick={resetControls} aria-label="Reset voice settings"><RotateCcw className="h-4 w-4" /></button></div>
            <div className="mt-5 space-y-5">
              <label className="block text-sm"><span className="mb-2 flex justify-between font-medium"><span>Speech speed</span><span className="text-muted-foreground">{speed.toFixed(1)}×</span></span><input className="w-full accent-primary" type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
              <label className="block text-sm"><span className="mb-2 flex justify-between font-medium"><span>Pitch</span><span className="text-muted-foreground">{pitch.toFixed(1)}</span></span><input className="w-full accent-primary" type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} /></label>
              <label className="block text-sm"><span className="mb-2 block font-medium">Tone</span><select id="voice-tone" className="w-full rounded-md border border-border bg-transparent px-3 py-2" value={tone} onChange={(event) => setTone(event.target.value)}>{toneOptions.map((option) => <option key={option}>{option}</option>)}</select><span className="mt-2 block text-xs text-muted-foreground">Tone is applied when supported by the selected voice provider.</span></label>
            </div>
          </section>
          <section className="card p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Speech preview</h2>{isSpeaking ? <button className="btn-secondary text-xs" type="button" onClick={stopPreview}><Square className="mr-1.5 h-3 w-3 fill-current" /> Stop</button> : <button className="btn-secondary text-xs" type="button" onClick={() => previewVoice()}><Play className="mr-1.5 h-3 w-3 fill-current" /> Preview</button>}</div><p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{status}</p></section>
        </aside>
      </div>

      <section className="card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Text to speech</h2><p className="mt-1 text-sm text-muted-foreground">Enter the narration you want to generate with {selectedVoice.name}.</p></div><span className="text-xs text-muted-foreground">{text.length} characters</span></div><textarea className="mt-5 min-h-36 w-full resize-y rounded-md border border-border bg-transparent p-3 text-sm leading-6 outline-none focus:border-primary" value={text} onChange={(event) => setText(event.target.value)} aria-label="Text to convert to speech" placeholder="Type or paste your narration here…" /><div className="mt-4 flex flex-wrap justify-end gap-3"><button className="btn-secondary" type="button" onClick={() => setText('')}>Clear text</button><button className="btn-primary" type="button" onClick={generateSpeech}><AudioLines className="mr-2 h-4 w-4" /> Generate and preview</button></div></section>
    </div>
  );
}
