'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const createLineaSchema = z.object({
  seccion_id: z.string().uuid(),
  orden: z.coerce.number().int().min(0).default(0),
  letra: z.string().max(1000).default(''),
  acordes_raw: z.string().max(500).default(''),
});

export async function createLinea(formData: FormData) {
  const parsed = createLineaSchema.safeParse({
    seccion_id: formData.get('seccion_id'),
    orden: formData.get('orden') || 0,
    letra: formData.get('letra') || '',
    acordes_raw: formData.get('acordes_raw') || '',
  });

  if (!parsed.success) {
    throw new Error(
      'Datos inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const { data, error } = await supabase
    .from('cb_lineas')
    .insert(parsed.data)
    .select('id')
    .single();

  if (error) throw new Error('Error al crear línea: ' + error.message);

  // Obtener cancion_id para revalidar
  const { data: seccion } = await supabase
    .from('cb_secciones')
    .select('cancion_id')
    .eq('id', parsed.data.seccion_id)
    .single();

  if (seccion) {
    revalidatePath(`/canciones/${seccion.cancion_id}`);
    revalidatePath(`/canciones/${seccion.cancion_id}/editar`);
  }

  return { id: data.id };
}
