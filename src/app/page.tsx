import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight">CHORDBOOK</h1>
        <p className="text-lg text-gray-600">
          Cancionero digital para músicos de iglesia.
          Sistema numérico con transposición automática.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/canciones"
            className="rounded-md border border-gray-300 px-6 py-2.5 font-medium hover:bg-gray-50 transition-colors"
          >
            Ver canciones
          </Link>
        </div>
      </div>
    </main>
  );
}
