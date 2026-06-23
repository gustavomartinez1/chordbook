'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const TONOS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export default function NuevaCancionPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lyricText, setLyricText] = useState('');
  const [selectedTono, setSelectedTono] = useState('C');

  useEffect(() => {
    const stored = sessionStorage.getItem('chordbook_pin');
    if (stored) setPin(stored);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    form.set('admin_pin', pin);
    form.set('letra', lyricText);

    // Parsear acordes inline estilo CifraClub: [G]texto[C]texto
    const acordesRaw = parseInlineChords(lyricText, selectedTono);
    form.set('acordes_raw', acordesRaw);

    try {
      const res = await fetch('/api/canciones/crear', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); }
      else if (data.redirect) { sessionStorage.setItem('chordbook_pin', pin); router.push(data.redirect); }
    } catch {
      setError('Error de conexión'); setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nueva canción</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PIN */}
        <div className="rounded-lg border border-amber-600/30 bg-amber-500/5 p-4">
          <Label className="text-amber-400">PIN de administrador</Label>
          <Input type="password" value={pin} onChange={(e) => { setPin(e.target.value); sessionStorage.setItem('chordbook_pin', e.target.value); }}
            placeholder="PIN de admin" required className="mt-1 border-amber-600/30" />
        </div>

        {/* Título y Artista */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required placeholder="Nombre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artista">Artista</Label>
            <Input id="artista" name="artista" placeholder="Autor" />
          </div>
        </div>

        {/* Tono, Tempo, Compás */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tono_original">Tono</Label>
            <select id="tono_original" name="tono_original" value={selectedTono} onChange={e => setSelectedTono(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm">
              {TONOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tempo">BPM</Label>
            <Input id="tempo" name="tempo" type="number" min={30} max={250} placeholder="70" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compas">Compás</Label>
            <select id="compas" name="compas" defaultValue="4/4"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm">
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
            </select>
          </div>
        </div>

        {/* Editor de letra con acordes tipo CifraClub */}
        <div className="space-y-2">
          <Label>Letra con acordes</Label>
          <p className="text-xs text-zinc-500">
            Escribe los acordes entre <code className="text-amber-400">[corchetes]</code> antes de la sílaba.
            Ej: <code className="text-amber-400">[G]Sublime [C]gracia que [G]salvó</code>
          </p>
          <textarea
            value={lyricText}
            onChange={(e) => setLyricText(e.target.value)}
            rows={10}
            placeholder={'[G]Sublime [C]gracia que [G]salvó\n[C]A un pobre [D]pecador\n...'}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Preview en vivo */}
        {lyricText.trim() && (
          <ChordPreviewView text={lyricText} tono={selectedTono} />
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando...' : 'Crear canción'}
        </Button>
      </form>
    </div>
  );
}

function parseInlineChords(text: string, tono: string): string {
  if (!text.trim()) return '';
  const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const SCALE = [0,2,4,5,7,9,11];
  const rootIdx = CHROMATIC.indexOf(tono);
  if (rootIdx < 0) return '';
  const scale = SCALE.map(i => CHROMATIC[(rootIdx + i) % 12]);

  const gradoMap: Record<string, number> = {};
  scale.forEach((n, i) => { gradoMap[n] = i + 1; });

  const regex = /\[([A-G][#b]?)([^\]]*)\]/g;
  let match;
  const acordes: string[] = [];
  let charPos = 0;

  let cleanText = text;
  while ((match = regex.exec(text)) !== null) {
    const notaBase = match[1]; charPos = match.index - (acordes.length > 0 ? 1 : 0) * (1);
    // Calculate position in clean text (without brackets)
    const textBefore = text.substring(0, match.index).replace(/\[[^\]]*\]/g, '');
    const pos = textBefore.length;
    const flatMap: Record<string, string> = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
    const nota = flatMap[notaBase] || notaBase;
    const grado = gradoMap[nota] || 1;
    acordes.push(`${grado}.0.${pos}`);
  }

  return acordes.join(' ');
}

function ChordPreviewView({ text, tono }: { text: string; tono: string }) {
  const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const SCALE = [0,2,4,5,7,9,11];
  const rootIdx = CHROMATIC.indexOf(tono);
  const scale = rootIdx >= 0 ? SCALE.map(i => CHROMATIC[(rootIdx + i) % 12]) : [];

  // Extraer [acordes] y generar preview
  const regex = /\[([A-G][#b]?)([^\]]*)\]/g;
  let cleanLyric = text.replace(regex, '');
  const chords: { nota: string; pos: number }[] = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const textBefore = text.substring(0, m.index).replace(/\[[^\]]*\]/g, '');
    chords.push({ nota: m[1] + m[2], pos: textBefore.length });
  }

  // Render acordes encima de letra
  const chordLine = new Array(cleanLyric.length).fill(' ');
  for (const c of chords) {
    if (c.pos < chordLine.length) {
      for (let i = 0; i < c.nota.length && c.pos + i < chordLine.length; i++) {
        chordLine[c.pos + i] = c.nota[i];
      }
    }
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <p className="mb-2 text-xs text-zinc-500">Preview:</p>
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-amber-400 whitespace-pre-wrap">{chordLine.join('')}</div>
        <div className="text-zinc-300 whitespace-pre-wrap">{cleanLyric}</div>
      </div>
    </div>
  );
}
