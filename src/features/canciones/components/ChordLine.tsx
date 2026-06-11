'use client';

import { useMemo } from 'react';
import { parseAcordes, acordeToNombre, type Tono } from '@/features/transpose/transpose';

interface ChordLineProps {
  letra: string;
  acordesRaw: string;
  tonalidadActual: string;
  tonoOriginal: string;
  fontSize?: number;
}

const COLORES_GRADO: Record<number, string> = {
  1: 'text-chord-i',
  2: 'text-chord-ii',
  3: 'text-chord-iii',
  4: 'text-chord-iv',
  5: 'text-chord-v',
  6: 'text-chord-vi',
  7: 'text-chord-vii',
};

/**
 * Renderiza una línea de letra con acordes flotando encima.
 * Los acordes se posicionan usando un contenedor monospace
 * donde cada carácter ocupa exactamente 1ch de ancho.
 */
export default function ChordLine({
  letra,
  acordesRaw,
  tonalidadActual,
  fontSize = 16,
}: ChordLineProps) {
  const acordes = useMemo(() => {
    const parsed = parseAcordes(acordesRaw);
    return parsed.map((a) => ({
      nombre: acordeToNombre(a, tonalidadActual as Tono),
      posicion: a.posicion,
      grado: a.grado,
    }));
  }, [acordesRaw, tonalidadActual]);

  // Si no hay letra ni acordes, no renderizar
  if (!letra && acordes.length === 0) return null;

  // Si no hay acordes, solo la letra
  if (acordes.length === 0) {
    return (
      <div
        className="font-mono leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
      >
        {letra || '\u00A0'}
      </div>
    );
  }

  return (
    <div
      className="font-mono leading-relaxed whitespace-pre-wrap relative"
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Fila de acordes */}
      <div className="relative h-[1.4em]">
        {acordes.map((acorde, i) => (
          <span
            key={i}
            className={`absolute font-bold ${COLORES_GRADO[acorde.grado] ?? 'text-primary'}`}
            style={{
              left: `${acorde.posicion}ch`,
              top: 0,
              lineHeight: 1.4,
              fontSize: '1.15em',
              letterSpacing: '0.02em',
              textShadow: '0 0 8px rgba(0,0,0,0.9)',
            }}
          >
            {acorde.nombre}
          </span>
        ))}
      </div>
      {/* Fila de letra */}
      <div className="relative text-foreground/90 min-h-[1.4em]">
        {letra || '\u00A0'}
      </div>
    </div>
  );
}
