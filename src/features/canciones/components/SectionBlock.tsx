'use client';

import { useState } from 'react';
import ChordLine from './ChordLine';

interface SectionBlockProps {
  nombre: string;
  lineas: Array<{
    id: string;
    letra: string | null;
    acordes_raw: string | null;
    orden: number;
  }>;
  tonalidadActual: string;
  tonoOriginal: string;
  defaultOpen?: boolean;
}

/**
 * Bloque de sección colapsable (Verso, Coro, Puente, etc.)
 * Muestra el nombre de la sección y sus líneas con acordes.
 */
export default function SectionBlock({
  nombre,
  lineas,
  tonalidadActual,
  tonoOriginal,
  defaultOpen = true,
}: SectionBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header de sección (click para colapsar) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted/80 transition-colors text-left"
      >
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-sm font-semibold uppercase tracking-wider text-amber-400/90">
          {nombre}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {lineas.length} línea{lineas.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Líneas */}
      {isOpen && (
        <div className="px-4 py-3 space-y-3 divide-y divide-border/50">
          {lineas.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Sin líneas
            </p>
          ) : (
            lineas.map((linea) => (
              <ChordLine
                key={linea.id}
                letra={linea.letra ?? ''}
                acordesRaw={linea.acordes_raw ?? ''}
                tonalidadActual={tonalidadActual}
                tonoOriginal={tonoOriginal}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
