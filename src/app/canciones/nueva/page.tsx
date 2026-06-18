import type { Metadata } from 'next';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createCancion } from '@/features/canciones/actions/createCancion';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Nueva canción',
  description: 'Agrega una nueva canción al cancionero.',
};

const TONOS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];

export default function NuevaCancionPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Nueva canción</h1>

      <form action={createCancion} className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            name="titulo"
            required
            placeholder="Nombre de la canción"
          />
        </div>

        {/* Artista */}
        <div className="space-y-2">
          <Label htmlFor="artista">Artista</Label>
          <Input
            id="artista"
            name="artista"
            placeholder="Autor o banda"
          />
        </div>

        {/* Tono original */}
        <div className="space-y-2">
          <Label htmlFor="tono_original">Tono original</Label>
          <select
            id="tono_original"
            name="tono_original"
            required
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {TONOS.map((tono) => (
              <option key={tono} value={tono}>
                {tono}
              </option>
            ))}
          </select>
        </div>

        {/* Tempo */}
        <div className="space-y-2">
          <Label htmlFor="tempo">Tempo (BPM, opcional)</Label>
          <Input
            id="tempo"
            name="tempo"
            type="number"
            min={30}
            max={250}
            placeholder="70"
          />
        </div>

        {/* Compás */}
        <div className="space-y-2">
          <Label htmlFor="compas">Compás</Label>
          <select
            id="compas"
            name="compas"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue="4/4"
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="2/4">2/4</option>
            <option value="12/8">12/8</option>
          </select>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notas">Notas (opcional)</Label>
          <textarea
            id="notas"
            name="notas"
            rows={3}
            placeholder="Instrucciones o notas adicionales..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        <Button type="submit" className="w-full">
          Crear canción
        </Button>
      </form>
    </div>
  );
}
