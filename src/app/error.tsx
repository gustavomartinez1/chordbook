'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4 text-muted-foreground/30">♫</div>
      <h1 className="text-3xl font-bold mb-2">Algo salió mal</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground h-8 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
