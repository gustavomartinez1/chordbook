import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chordbook.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Intentar obtener canciones de Supabase para incluir en sitemap
  let cancionUrls: MetadataRoute.Sitemap = [];

  try {
    const { createClient } = await import('@/shared/lib/supabase/server');
    const supabase = await createClient();
    const { data: cancionData } = await supabase
      .from('cb_canciones')
      .select('id, updated_at')
      .limit(100);

    if (cancionData) {
      cancionUrls = cancionData.map((c) => ({
        url: `${BASE_URL}/canciones/${c.id}`,
        lastModified: c.updated_at ?? undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Si falla (no auth en build time), ignorar
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...cancionUrls,
  ];
}
