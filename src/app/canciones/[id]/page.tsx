import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/shared/lib/supabase/server';
import { cookies } from 'next/headers';
import { isAdminFromCookies } from '@/shared/lib/admin-check';
import CancionViewClient from './CancionViewClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCancion(id: string) {
  const supabase = await createClient();
  const { data: cancion } = await supabase
    .from('cb_canciones')
    .select('*')
    .eq('id', id)
    .single();

  if (!cancion) return null;

  const { data: secciones } = await supabase
    .from('cb_secciones')
    .select('*')
    .eq('cancion_id', id)
    .order('orden', { ascending: true });

  const seccionesConLineas = await Promise.all(
    (secciones ?? []).map(async (seccion) => {
      const { data: lineas } = await supabase
        .from('cb_lineas')
        .select('*')
        .eq('seccion_id', seccion.id)
        .order('orden', { ascending: true });

      return {
        ...seccion,
        lineas: lineas ?? [],
      };
    })
  );

  return {
    ...cancion,
    secciones: seccionesConLineas,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cancion = await getCancion(id);
  if (!cancion) return { title: 'Canción no encontrada' };

  return {
    title: cancion.titulo,
    description: `${cancion.titulo}${cancion.artista ? ` — ${cancion.artista}` : ''}. Tono original: ${cancion.tono_original}.`,
    openGraph: {
      title: `${cancion.titulo} | CHORDBOOK`,
      description: `${cancion.titulo}${cancion.artista ? ` — ${cancion.artista}` : ''} en tono ${cancion.tono_original}.`,
      type: 'music.song',
    },
  };
}

export default async function CancionPage({ params }: PageProps) {
  const { id } = await params;

  const cancion = await getCancion(id);
  if (!cancion) notFound();

  const cookieStore = await cookies();
  const isAdmin = isAdminFromCookies(cookieStore);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: cancion.titulo,
    byArtist: cancion.artista
      ? { '@type': 'MusicGroup', name: cancion.artista }
      : undefined,
    inLanguage: 'es',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cancion.titulo}</h1>
            {cancion.artista && (
              <p className="text-lg text-muted-foreground mt-1">
                {cancion.artista}
              </p>
            )}
          </div>
        </div>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="font-mono text-amber-400/80 font-semibold">
            Tono original: {cancion.tono_original}
          </span>
          {cancion.tempo && <span>♩ {cancion.tempo} BPM</span>}
          {cancion.compas && <span>𝄵 {cancion.compas}</span>}
          {cancion.notas && (
            <span className="italic text-xs">{cancion.notas}</span>
          )}
        </div>
      </div>

      {/* Client Component con transposición y modo presentación */}
      <CancionViewClient cancion={cancion} isAdmin={isAdmin} />
    </div>
  );
}
