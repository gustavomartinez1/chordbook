import type { Metadata } from 'next';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createCancion } from '@/features/canciones/actions/createCancion';

export const metadata: Metadata = {
  title: 'Nueva canción',
  description: 'Agrega una nueva canción al cancionero.',
};

const TONOS = [
  { value: 'C', label: 'C (Do Mayor)' },
  { value: 'C#', label: 'C# (Do# Mayor) — también Db' },
  { value: 'D', label: 'D (Re Mayor)' },
  { value: 'D#', label: 'D# (Re# Mayor) — también Eb' },
  { value: 'E', label: 'E (Mi Mayor)' },
  { value: 'F', label: 'F (Fa Mayor)' },
  { value: 'F#', label: 'F# (Fa# Mayor) — también Gb' },
  { value: 'G', label: 'G (Sol Mayor)' },
  { value: 'G#', label: 'G# (Sol# Mayor) — también Ab' },
  { value: 'A', label: 'A (La Mayor)' },
  { value: 'A#', label: 'A# (La# Mayor) — también Bb' },
  { value: 'B', label: 'B (Si Mayor)' },
];

export default function NuevaCancionPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Nueva canción</h1>

      <form action={createCancion} className="space-y-6">
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
          <select
            id="tono_original"
            name="tono_original"
            required
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TONOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempo">Tempo (BPM, opcional)</Label>
          <Input id="tempo" name="tempo" type="number" min={30} max={250} placeholder="70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compas">Compás</Label>
          <select
            id="compas"
            name="compas"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue="4/4"
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="2/4">2/4</option>
            <option value="12/8">12/8</option>
          </select>
        </div>

        <Button type="submit" className="w-full">Crear canción</Button>
      </form>
    </div>
  );
}
