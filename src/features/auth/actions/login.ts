'use server';

import { z } from 'zod';
import { createClient } from '@/shared/lib/supabase/server';
import { headers } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Correo inválido',
    };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') ?? 'http://localhost:3000';

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}
