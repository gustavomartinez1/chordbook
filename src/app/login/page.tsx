import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">CHORDBOOK</h1>
          <p className="mt-2 text-gray-600">
            Ingresa tu correo para recibir un enlace mágico
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
