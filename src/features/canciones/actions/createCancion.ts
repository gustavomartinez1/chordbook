'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Database } from '@/shared/types/supabase';

const createCancionSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(200),
  artista: z.string().max(200).default(''),
  tono_original: z.string().length(1, { message: 'Tono inválido' }).or(z.string().length(2)),
  tempo: z.coerce.number().int().min(30).max(250).optional().nullable(),
  compas: z.string().default('4/4'),
  notas: z.string().max(2000).default(''),
});

export async function createCancion(formData: FormData) {
  const parsed = createCancionSchema.safeParse({
    titulo: formData.get('titulo'),
    artista: formData.get('artista') || '',
    tono_original: formData.get('tono_original'),
    tempo: formData.get('tempo') || null,
    compas: formData.get('compas') || '4/4',
    notas: formData.get('notas') || '',
  });

  if (!parsed.success) {
    throw new Error(
      'Datos inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const insertData = {
    titulo: parsed.data.titulo,
    artista: parsed.data.artista || null,
    tono_original: parsed.data.tono_original,
    tempo: parsed.data.tempo ?? null,
    compas: parsed.data.compas || null,
    notas: parsed.data.notas || null,
    created_by: user.id,
  } satisfies Omit<Database['public']['Tables']['cb_canciones']['Insert'], 'id' | 'created_at' | 'updated_at'>;

  const { data, error } = await supabase
    .from('cb_canciones')
    .insert(insertData)
    .select('id')
    .single();

  if (error) throw new Error('Error al crear canción: ' + error.message);

  revalidatePath('/');
  redirect(`/canciones/${data.id}/editar`);
}
