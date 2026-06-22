'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { isAdminFromCookies } from '@/shared/lib/admin-check';

const updateCancionSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1).max(200).optional(),
  artista: z.string().max(200).optional(),
  tono_original: z.string().optional(),
  tempo: z.coerce.number().int().min(30).max(250).optional().nullable(),
  compas: z.string().optional(),
  notas: z.string().max(2000).optional(),
});

export async function updateCancion(formData: FormData) {
  const parsed = updateCancionSchema.safeParse({
    id: formData.get('id'),
    titulo: formData.get('titulo') || undefined,
    artista: formData.get('artista') !== undefined ? formData.get('artista') : undefined,
    tono_original: formData.get('tono_original') || undefined,
    tempo: formData.get('tempo') !== '' && formData.get('tempo') !== null
      ? formData.get('tempo')
      : null,
    compas: formData.get('compas') || undefined,
    notas: formData.get('notas') !== undefined ? formData.get('notas') : undefined,
  });

  if (!parsed.success) {
    throw new Error(
      'Datos invÃ¡lidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }


    const cookieStore = await cookies();
    if (!isAdminFromCookies(cookieStore)) throw new Error('Solo administradores');

    const supabase = await createClient();
    const { id, ...data } = parsed.data;

  const { error } = await supabase
    .from('cb_canciones')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Error al actualizar canciÃ³n: ' + error.message);

  revalidatePath(`/canciones/${id}`);
  revalidatePath(`/canciones/${id}/editar`);
  revalidatePath('/');
}
