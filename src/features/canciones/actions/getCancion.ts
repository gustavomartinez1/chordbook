'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import type { CancionCompleta } from '@/shared/types/supabase';

const getCancionSchema = z.object({
  id: z.string().uuid(),
});

export async function getCancion(input: { id: string }): Promise<CancionCompleta> {
  const parsed = getCancionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('ID inválido');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  // Obtener canción
  const { data: cancion, error: errorCancion } = await supabase
    .from('cb_canciones')
    .select('*')
    .eq('id', parsed.data.id)
    .single();

  if (errorCancion) throw new Error('Error al obtener canción: ' + errorCancion.message);
  if (!cancion) throw new Error('Canción no encontrada');

  // Obtener secciones
  const { data: secciones, error: errorSecciones } = await supabase
    .from('cb_secciones')
    .select('*')
    .eq('cancion_id', parsed.data.id)
    .order('orden', { ascending: true });

  if (errorSecciones) throw new Error('Error al obtener secciones: ' + errorSecciones.message);

  // Obtener líneas para cada sección
  const seccionesConLineas = await Promise.all(
    (secciones ?? []).map(async (seccion) => {
      const { data: lineas, error: errorLineas } = await supabase
        .from('cb_lineas')
        .select('*')
        .eq('seccion_id', seccion.id)
        .order('orden', { ascending: true });

      if (errorLineas) throw new Error('Error al obtener líneas: ' + errorLineas.message);

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
