'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const deleteLineaSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteLinea(formData: FormData) {
  const parsed = deleteLineaSchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    throw new Error('ID inválido');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  // Obtener seccion_id antes de eliminar
  const { data: linea } = await supabase
    .from('cb_lineas')
    .select('seccion_id')
    .eq('id', parsed.data.id)
    .single();

  if (!linea) throw new Error('Línea no encontrada');

  const { error } = await supabase
    .from('cb_lineas')
    .delete()
    .eq('id', parsed.data.id);

  if (error) throw new Error('Error al eliminar línea: ' + error.message);

  // Obtener cancion_id para revalidar
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
