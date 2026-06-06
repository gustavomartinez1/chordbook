'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions/login';

async function loginActionWrapper(_prevState: { success: boolean; error?: string }, formData: FormData) {
  return loginAction(formData);
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginActionWrapper,
    { success: false }
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.success ? (
        <div className="rounded-md bg-green-50 p-4 text-green-800 text-sm">
          ✉️ Revisa tu correo. Te hemos enviado un enlace mágico para iniciar sesión.
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="tu@correo.com"
            />
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Enviando...' : 'Enviar enlace mágico'}
          </button>
        </>
      )}
    </form>
  );
}
