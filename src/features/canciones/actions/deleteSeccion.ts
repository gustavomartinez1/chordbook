'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const deleteSeccionSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteSeccion(formData: FormData) {
  const parsed = deleteSeccionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    throw new Error('ID inválido');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  // Obtener cancion_id antes de eliminar
  const { data: seccion } = await supabase
    .from('cb_secciones')
    .select('cancion_id')
    .eq('id', parsed.data.id)
    .single();

  if (!seccion) throw new Error('Sección no encontrada');

  const { error } = await supabase
    .from('cb_secciones')
    .delete()
    .eq('id', parsed.data.id);

  if (error) throw new Error('Error al eliminar sección: ' + error.message);

  revalidatePath(`/canciones/${seccion.cancion_id}`);
  revalidatePath(`/canciones/${seccion.cancion_id}/editar`);
}
