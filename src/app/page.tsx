import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { Input } from '@/shared/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface CancionRow {
  id: string;
  titulo: string;
  artista: string | null;
  tono_original: string;
  tempo: number | null;
  compas: string | null;
}

async function getCanciones(busqueda?: string): Promise<CancionRow[]> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  let query = supabase
    .from('cb_canciones')
    .select('id, titulo, artista, tono_original, tempo, compas')
    .order('created_at', { ascending: false })
    .limit(50);

  if (busqueda && busqueda.trim()) {
    query = query.or(
      `titulo.ilike.%${busqueda.trim()}%,artista.ilike.%${busqueda.trim()}%`
    );
  }

  const { data } = await query;
  return (data ?? []) as CancionRow[];
}

async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { data } = await supabase
    .from('cb_roles')
    .select('rol')
    .eq('user_id', user.user.id)
    .single();

  return (data?.rol as string) ?? null;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const busqueda = params.q;
  const [canciones, role] = await Promise.all([
    getCanciones(busqueda),
    getCurrentUserRole(),
  ]);

  const isAdmin = role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          CHORDBOOK
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cancionero digital para músicos de iglesia.
          Sistema numérico con transposición automática.
        </p>
      </div>

      {/* Búsqueda y acciones */}
      <div className="flex items-center gap-3 mb-6">
        <form className="flex-1">
          <Input
            type="search"
            name="q"
            defaultValue={busqueda ?? ''}
            placeholder="Buscar por título o artista..."
            className="w-full"
          />
        </form>
        {isAdmin && (
          <Link
            href="/canciones/nueva"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
          >
            + Nueva canción
          </Link>
        )}
      </div>

      {/* Grid de canciones */}
      {canciones.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 text-muted-foreground/30">♫</div>
          <p className="text-muted-foreground">
            {busqueda
              ? 'No se encontraron canciones con esa búsqueda.'
              : 'No hay canciones aún.'}
          </p>
          {isAdmin && (
            <Link
              href="/canciones/nueva"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
            >
              Crear primera canción
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {canciones.map((cancion) => (
            <Link key={cancion.id} href={`/canciones/${cancion.id}`}>
              <Card className="h-full hover:border-amber-500/30 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {cancion.titulo}
                  </CardTitle>
                  {cancion.artista && (
                    <p className="text-sm text-muted-foreground">
                      {cancion.artista}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono text-amber-400/80 font-semibold">
                    Tono: {cancion.tono_original}
                  </span>
                  {cancion.tempo && (
                    <span>♩ {cancion.tempo} BPM</span>
                  )}
                  {cancion.compas && (
                    <span>𝄵 {cancion.compas}</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
