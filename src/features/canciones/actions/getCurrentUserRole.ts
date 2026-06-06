'use server';

import { createClient } from '@/shared/lib/supabase/server';

export type UserRole = 'admin' | 'musico' | null;

export async function getCurrentUserRole(): Promise<UserRole> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cb_roles')
    .select('rol')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  return data.rol as UserRole;
}
