'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const createSeccionSchema = z.object({
  cancion_id: z.string().uuid(),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  orden: z.coerce.number().int().min(0).default(0),
});

export async function createSeccion(formData: FormData) {
  const parsed = createSeccionSchema.safeParse({
    cancion_id: formData.get('cancion_id'),
    nombre: formData.get('nombre'),
    orden: formData.get('orden') || 0,
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
    .from('cb_secciones')
    .insert(parsed.data)
    .select('id')
    .single();

  if (error) throw new Error('Error al crear sección: ' + error.message);

  revalidatePath(`/canciones/${parsed.data.cancion_id}`);
  revalidatePath(`/canciones/${parsed.data.cancion_id}/editar`);

  return { id: data.id };
}
