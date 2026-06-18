import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/shared/lib/supabase/server';
import { createSeccion } from '@/features/canciones/actions/createSeccion';
import { deleteLinea } from '@/features/canciones/actions/deleteLinea';
import { createLinea } from '@/features/canciones/actions/createLinea';
import { updateLinea } from '@/features/canciones/actions/updateLinea';
import EditarCancionClient from './EditarCancionClient';
export const runtime = 'edge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Editar canción',
  description: 'Editor de canciones con secciones y acordes.',
};

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

async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return false;

  const { data } = await supabase
    .from('cb_roles')
    .select('rol')
    .eq('user_id', user.user.id)
    .single();

  return data?.rol === 'admin';
}

export default async function EditarCancionPage({ params }: PageProps) {
  const [isAdmin, { id }] = await Promise.all([checkAdmin(), params]);

  if (!isAdmin) {
    redirect(`/canciones/${id}`);
  }

  const cancion = await getCancion(id);
  if (!cancion) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{cancion.titulo}</h1>
        {cancion.artista && (
          <p className="text-muted-foreground">{cancion.artista}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Tono original:{' '}
          <span className="font-mono text-amber-400/80">
            {cancion.tono_original}
          </span>
        </p>
      </div>

      <EditarCancionClient
        cancion={cancion}
        cancionId={cancion.id}
        createSeccionAction={createSeccion}
        deleteLineaAction={deleteLinea}
        createLineaAction={createLinea}
        updateLineaAction={updateLinea}
      />
    </div>
  );
}
