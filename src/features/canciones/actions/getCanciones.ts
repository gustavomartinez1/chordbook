'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const getCancionesSchema = z.object({
  busqueda: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function getCanciones(input: {
  busqueda?: string;
  page?: number;
  limit?: number;
}) {
  const parsed = getCancionesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Parámetros inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const { busqueda, page, limit } = parsed.data;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('cb_canciones')
    .select('id, titulo, artista, tono_original, tempo, compas, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (busqueda && busqueda.trim()) {
    query = query.or(
      `titulo.ilike.%${busqueda.trim()}%,artista.ilike.%${busqueda.trim()}%`
    );
  }

  const { data: canciones, error, count } = await query.range(from, to);

  if (error) throw new Error('Error al obtener canciones: ' + error.message);

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return {
    canciones: canciones ?? [],
    total: count ?? 0,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
