'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const updateSeccionSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1).max(100).optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

export async function updateSeccion(formData: FormData) {
  const parsed = updateSeccionSchema.safeParse({
    id: formData.get('id'),
    nombre: formData.get('nombre') || undefined,
    orden: formData.get('orden') !== null ? formData.get('orden') : undefined,
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
    .from('cb_secciones')
    .update(data)
    .eq('id', id);

  if (error) throw new Error('Error al actualizar sección: ' + error.message);

  // Obtener cancion_id para revalidar
  const { data: seccion } = await supabase
    .from('cb_secciones')
    .select('cancion_id')
    .eq('id', id)
    .single();

  if (seccion) {
    revalidatePath(`/canciones/${seccion.cancion_id}`);
    revalidatePath(`/canciones/${seccion.cancion_id}/editar`);
  }
}
