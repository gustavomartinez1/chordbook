'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyPin } from '@/shared/lib/admin-check';

const deleteSeccionSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteSeccion(formData: FormData) {
  const parsed = deleteSeccionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    throw new Error('ID invÃ¡lido');
  }


        const supabase = await createClient();
    // Obtener cancion_id antes de eliminar
  const { data: seccion } = await supabase
    .from('cb_secciones')
    .select('cancion_id')
    .eq('id', parsed.data.id)
    .single();

  if (!seccion) throw new Error('SecciÃ³n no encontrada');

  const { error } = await supabase
    .from('cb_secciones')
    .delete()
    .eq('id', parsed.data.id);

  if (error) throw new Error('Error al eliminar secciÃ³n: ' + error.message);

  revalidatePath(`/canciones/${seccion.cancion_id}`);
  revalidatePath(`/canciones/${seccion.cancion_id}/editar`);
}
