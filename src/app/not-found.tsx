export const runtime = 'edge';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4 text-muted-foreground/30">♫</div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Esta página no existe o no está disponible.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
