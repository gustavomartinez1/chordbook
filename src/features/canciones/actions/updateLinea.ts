'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const updateLineaSchema = z.object({
  id: z.string().uuid(),
  orden: z.coerce.number().int().min(0).optional(),
  letra: z.string().max(1000).optional(),
  acordes_raw: z.string().max(500).optional(),
});

export async function updateLinea(formData: FormData) {
  const parsed = updateLineaSchema.safeParse({
    id: formData.get('id'),
    orden: formData.get('orden') !== null ? formData.get('orden') : undefined,
    letra: formData.get('letra') !== null ? formData.get('letra') : undefined,
    acordes_raw: formData.get('acordes_raw') !== null ? formData.get('acordes_raw') : undefined,
  });

  if (!parsed.success) {
    throw new Error(
      'Datos inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const { id, ...data } = parsed.data;

  const { error } = await supabase
    .from('cb_lineas')
    .update(data)
    .eq('id', id);

  if (error) throw new Error('Error al actualizar línea: ' + error.message);

  // Obtener cancion_id para revalidar (a través de la sección)
  const { data: linea } = await supabase
    .from('cb_lineas')
    .select('seccion_id')
    .eq('id', id)
    .single();

  if (linea) {
    const { data: seccion } = await supabase
      .from('cb_secciones')
      .select('cancion_id')
      .eq('id', linea.seccion_id)
      .single();

    if (seccion) {
      revalidatePath(`/canciones/${seccion.cancion_id}`);
      revalidatePath(`/canciones/${seccion.cancion_id}/editar`);
    }
  }
}
