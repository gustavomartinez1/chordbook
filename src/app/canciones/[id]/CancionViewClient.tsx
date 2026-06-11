'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import ToneSelector from '@/features/canciones/components/ToneSelector';
import SectionBlock from '@/features/canciones/components/SectionBlock';
import PresentationMode from '@/features/canciones/components/PresentationMode';
import type { CancionCompleta } from '@/shared/types/supabase';

interface CancionViewClientProps {
  cancion: CancionCompleta;
  isAdmin: boolean;
}

export default function CancionViewClient({
  cancion,
  isAdmin,
}: CancionViewClientProps) {
  const [tonalidadActual, setTonalidadActual] = useState(cancion.tono_original);
  const [showPresentation, setShowPresentation] = useState(false);

  if (showPresentation) {
    return (
      <PresentationMode
        cancion={cancion}
        tonalidadActual={tonalidadActual}
        tonoOriginal={cancion.tono_original}
        onExit={() => setShowPresentation(false)}
      />
    );
  }

  return (
    <>
      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
        <ToneSelector
          value={tonalidadActual}
          onChange={setTonalidadActual}
          label="Transponer a"
        />

        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Link
              href={`/canciones/${cancion.id}/editar`}
              className="inline-flex items-center justify-center border border-border bg-background hover:bg-muted hover:text-foreground h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] text-sm font-medium whitespace-nowrap transition-all outline-none select-none"
            >
              Editar
            </Link>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowPresentation(true)}
          >
            ▶ Modo Presentación
          </Button>
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-3">
        {cancion.secciones.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-8">
            Esta canción no tiene secciones aún.
            {isAdmin && (
              <Link
                href={`/canciones/${cancion.id}/editar`}
                className="block mt-2 text-amber-400 hover:text-amber-300 underline"
              >
                Ir al editor
              </Link>
            )}
          </p>
        ) : (
          cancion.secciones.map((seccion) => (
            <SectionBlock
              key={seccion.id}
              nombre={seccion.nombre}
              lineas={seccion.lineas}
              tonalidadActual={tonalidadActual}
              tonoOriginal={cancion.tono_original}
            />
          ))
        )}
      </div>
    </>
  );
}
