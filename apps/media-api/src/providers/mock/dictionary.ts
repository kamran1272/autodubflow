/**
 * Bundled dictionaries for the offline (mock) translation provider.
 * Keeping the vocabulary data separate from the provider logic keeps both files
 * small and makes it obvious what the offline provider can and cannot do.
 */

export const PHRASES: Record<string, Record<string, string>> = {
  es: {
    'thank you': 'gracias',
    'thanks for watching': 'gracias por ver',
    'end to end': 'de principio a fin',
    'step by step': 'paso a paso',
    'let us': 'vamos a',
    'global audience': 'audiencia global',
    'product launch': 'lanzamiento de producto',
    'word level': 'a nivel de palabra',
    'one step at a time': 'un paso a la vez',
    'final cut': 'corte final',
    'in minutes': 'en minutos',
  },
  fr: {
    'thank you': 'merci',
    'product launch': 'lancement du produit',
    'let us': 'nous allons',
    'step by step': 'pas à pas',
  },
  de: {
    'thank you': 'danke',
    'product launch': 'produkteinführung',
    'let us': 'lass uns',
    'step by step': 'Schritt für Schritt',
  },
  pt: {
    'thank you': 'obrigado',
    'product launch': 'lançamento do produto',
    'let us': 'vamos',
  },
  it: {
    'thank you': 'grazie',
    'product launch': 'lancio del prodotto',
    'let us': 'andiamo',
  },
};

export const WORDS: Record<string, Record<string, string>> = {
  es: {
    a: 'un', about: 'sobre', accurate: 'precisos', after: 'después', all: 'todo', also: 'también',
    an: 'un', and: 'y', are: 'son', as: 'como', at: 'en', audio: 'audio', background: 'segundo plano',
    be: 'ser', because: 'porque', before: 'antes', built: 'construimos', business: 'negocio', but: 'pero',
    by: 'por', can: 'puede', click: 'haz clic', complete: 'completo', content: 'contenido',
    control: 'control', create: 'crear', dialogue: 'diálogo', does: 'hace', dubbing: 'doblaje', each: 'cada',
    end: 'final', enjoy: 'disfruta', every: 'cada', example: 'ejemplo', export: 'exportar',
    faster: 'más rápido', file: 'archivo', final: 'final', finally: 'finalmente', fine: 'ajustar',
    first: 'primero', for: 'para', from: 'de', full: 'completo', generated: 'generado', global: 'global',
    good: 'bueno', here: 'aquí', high: 'alta', how: 'cómo', i: 'yo', in: 'en', instead: 'en lugar de',
    into: 'en', introducing: 'presentamos', is: 'es', it: 'esto', keep: 'mantener', language: 'idioma',
    let: 'vamos', line: 'línea', localized: 'localizada', message: 'mensaje', minutes: 'minutos',
    natural: 'natural', needs: 'necesita', new: 'nuevo', next: 'siguiente', not: 'no', of: 'de',
    on: 'en', one: 'uno', original: 'original', our: 'nuestro', pipeline: 'flujo', preview: 'vista previa',
    product: 'producto', project: 'proyecto', publish: 'publicar', quality: 'calidad', ready: 'listo',
    reaches: 'llega', result: 'resultado', review: 'revisar', sample: 'muestra', screen: 'pantalla',
    segment: 'segmento', select: 'selecciona', single: 'único', so: 'así que', software: 'software',
    sounding: 'sonido', speech: 'voz', start: 'empezar', studio: 'estudio', subtitles: 'subtítulos',
    support: 'soporte', take: 'encargar', team: 'equipo', thanks: 'gracias', that: 'eso', the: 'la',
    then: 'luego', this: 'este', timing: 'sincronización', to: 'a', today: 'hoy', track: 'pista',
    transcribed: 'transcrita', translated: 'traducida', translation: 'traducción', tune: 'ajustar',
    up: 'arriba', upload: 'subir', very: 'muy', video: 'video', voice: 'voz', voiceover: 'doblaje',
    wait: 'espera', watching: 'ver', way: 'manera', we: 'nosotros', weeks: 'semanas', welcome: 'bienvenido',
    well: 'bien', when: 'cuando', with: 'con', without: 'sin', word: 'palabra', workflow: 'flujo de trabajo',
    world: 'mundo', you: 'tú', your: 'tu',
  },
  fr: {
    the: 'le', and: 'et', you: 'vous', your: 'votre', video: 'vidéo', voice: 'voix', welcome: 'bienvenue',
    to: 'à', of: 'de', in: 'dans', is: 'est', we: 'nous', our: 'notre', team: 'équipe', product: 'produit',
    speech: 'parole', translated: 'traduit', studio: 'studio', export: 'exporter', preview: 'aperçu',
    timing: 'synchronisation', language: 'langue', global: 'mondial', message: 'message', thanks: 'merci',
  },
  de: {
    the: 'der', and: 'und', you: 'du', your: 'dein', video: 'Video', voice: 'Stimme', welcome: 'willkommen',
    to: 'zu', of: 'von', in: 'in', is: 'ist', we: 'wir', our: 'unser', team: 'Team', product: 'Produkt',
    speech: 'Sprache', translated: 'übersetzt', studio: 'Studio', export: 'exportieren', preview: 'Vorschau',
    timing: 'Timing', language: 'Sprache', global: 'global', message: 'Nachricht', thanks: 'danke',
  },
  pt: {
    the: 'o', and: 'e', you: 'você', your: 'seu', video: 'vídeo', voice: 'voz', welcome: 'bem-vindo',
    to: 'para', of: 'de', in: 'em', is: 'é', we: 'nós', our: 'nosso', team: 'equipe', product: 'produto',
    speech: 'fala', translated: 'traduzido', studio: 'estúdio', export: 'exportar', preview: 'visualizar',
    language: 'idioma', global: 'global', message: 'mensagem', thanks: 'obrigado',
  },
  it: {
    the: 'il', and: 'e', you: 'tu', your: 'tuo', video: 'video', voice: 'voce', welcome: 'benvenuto',
    to: 'a', of: 'di', in: 'in', is: 'è', we: 'noi', our: 'nostro', team: 'team', product: 'prodotto',
    speech: 'parlato', translated: 'tradotto', studio: 'studio', export: 'esporta', preview: 'anteprima',
    language: 'lingua', global: 'globale', message: 'messaggio', thanks: 'grazie',
  },
};
