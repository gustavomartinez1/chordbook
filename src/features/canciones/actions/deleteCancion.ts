'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyPin } from '@/shared/lib/admin-check';
import { redirect } from 'next/navigation';

const deleteCancionSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteCancion(formData: FormData) {
  const parsed = deleteCancionSchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    throw new Error('ID inválido');
  }

    const supabase = await createClient();

  const { error } = await supabase
    .from('cb_canciones')
    .delete()
    .eq('id', parsed.data.id);

  if (error) throw new Error('Error al eliminar canción: ' + error.message);

  revalidatePath('/');
  redirect('/');
}
