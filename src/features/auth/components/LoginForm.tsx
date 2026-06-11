'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions/login';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

async function loginActionWrapper(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  return loginAction(formData);
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginActionWrapper, {
    success: false,
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.success ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 text-sm text-center">
          ✉️ Revisa tu correo. Te hemos enviado un enlace mágico para iniciar sesión.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@correo.com"
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Enviando...' : 'Enviar enlace mágico'}
          </Button>
        </>
      )}
    </form>
  );
}
