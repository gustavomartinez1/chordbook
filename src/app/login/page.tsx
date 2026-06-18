import type { Metadata } from 'next';
import LoginForm from '@/features/auth/components/LoginForm';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Accede a CHORDBOOK con tu correo electrónico. Recibirás un enlace mágico para entrar.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CHORDBOOK</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo para recibir un enlace mágico
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
