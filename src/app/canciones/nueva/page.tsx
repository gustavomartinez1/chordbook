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

    try {
      const res = await fetch('/api/canciones/crear', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else if (data.redirect) {
        sessionStorage.setItem('chordbook_pin', pin);
        router.push(data.redirect);
      }
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nueva canción</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-amber-600/30 bg-amber-500/5 p-4">
          <Label className="text-amber-400">PIN de administrador</Label>
          <Input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); sessionStorage.setItem('chordbook_pin', e.target.value); }}
            placeholder="PIN de admin"
            required
            className="mt-1 border-amber-600/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" required placeholder="Nombre de la canción" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="artista">Artista</Label>
          <Input id="artista" name="artista" placeholder="Autor o banda" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tono_original">Tono original</Label>
          <select id="tono_original" name="tono_original" required
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TONOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo (BPM)</Label>
            <Input id="tempo" name="tempo" type="number" min={30} max={250} placeholder="70" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compas">Compás</Label>
            <select id="compas" name="compas" defaultValue="4/4"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando...' : 'Crear canción'}
        </Button>
      </form>
    </div>
  );
}
