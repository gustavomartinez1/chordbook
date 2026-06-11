'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0a0a0f] text-[#f5f0e8] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 opacity-30">♫</div>
          <h1 className="text-3xl font-bold mb-2">Error crítico</h1>
          <p className="text-white/60 mb-6">
            La aplicación falló al cargar. Por favor recarga la página.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-amber-500/80 text-black px-4 py-2 text-sm font-medium hover:bg-amber-400 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </body>
    </html>
  );
}
