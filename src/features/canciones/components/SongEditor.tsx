'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import LineEditor from './LineEditor';
import SectionBlock from './SectionBlock';
import ToneSelector from './ToneSelector';
import type { CancionCompleta } from '@/shared/types/supabase';

interface SongEditorProps {
  cancion: CancionCompleta;
  esAdmin: boolean;
  onAddSeccion: (nombre: string) => Promise<void>;
  onDeleteLinea: (id: string) => Promise<void>;
  onAddLinea: (seccionId: string, orden: number) => Promise<void>;
  onUpdateLinea: (
    id: string,
    data: { letra?: string; acordes_raw?: string; orden?: number }
  ) => Promise<void>;
}

const TIPOS_SECCION = [
  'Intro',
  'Verso',
  'Coro',
  'Puente',
  'Pre-Coro',
  'Outro',
  'Interludio',
];

/**
 * Editor completo de una canción con secciones reordenables,
 * edición de líneas y preview en tiempo real.
 */
export default function SongEditor({
  cancion,
  onAddSeccion,
  onDeleteLinea,
  onAddLinea,
  onUpdateLinea,
}: SongEditorProps) {
  const [secciones, setSecciones] = useState(cancion.secciones);
  const [tonalidadPreview, setTonalidadPreview] = useState(cancion.tono_original);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mover sección arriba/abajo
  const moveSeccion = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= secciones.length) return;

      const newSecciones = [...secciones];
      const [moved] = newSecciones.splice(index, 1);
      newSecciones.splice(newIndex, 0, moved);

      // Actualizar orden
      newSecciones.forEach((s, i) => {
        s.orden = i;
      });

      setSecciones(newSecciones);
    },
    [secciones]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Preview en tiempo real ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Vista previa
          </h3>
          <ToneSelector
            value={tonalidadPreview}
            onChange={setTonalidadPreview}
          />
        </div>

        <div className="space-y-3">
          {secciones.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Sin secciones. Agrega una desde el panel de edición.
            </p>
          ) : (
            secciones.map((seccion) => (
              <SectionBlock
                key={seccion.id}
                nombre={seccion.nombre}
                lineas={seccion.lineas}
                tonalidadActual={tonalidadPreview}
                tonoOriginal={cancion.tono_original}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── Panel de edición ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Editor de secciones
          </h3>
        </div>

        {secciones.map((seccion, idx) => (
          <div
            key={seccion.id}
            className="border border-border rounded-lg overflow-hidden"
          >
            {/* Header de sección editable */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
              <Input
                value={seccion.nombre}
                onChange={(e) => {
                  const newSecciones = [...secciones];
                  newSecciones[idx] = {
                    ...newSecciones[idx],
                    nombre: e.target.value,
                  };
                  setSecciones(newSecciones);
                }}
                className="h-7 text-xs font-semibold uppercase tracking-wider w-32 border-0 bg-transparent"
              />

              <div className="flex items-center gap-0.5 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={idx === 0}
                  onClick={() => moveSeccion(idx, 'up')}
                  title="Mover arriba"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={idx === secciones.length - 1}
                  onClick={() => moveSeccion(idx, 'down')}
                  title="Mover abajo"
                >
                  ↓
                </Button>
              </div>
            </div>

            {/* Líneas editables */}
            <div className="px-3 py-2">
              {seccion.lineas.map((linea) => (
                <LineEditor
                  key={linea.id}
                  id={linea.id}
                  letra={linea.letra ?? ''}
                  acordesRaw={linea.acordes_raw ?? ''}
                  orden={linea.orden}
                  onUpdate={(data) => {
                    onUpdateLinea(linea.id, data);
                    // Actualizar estado local para preview inmediata
                    const newSecciones = [...secciones];
                    const lineas = [...newSecciones[idx].lineas];
                    const li = lineas.findIndex((l) => l.id === linea.id);
                    if (li !== -1) {
                      lineas[li] = { ...lineas[li], ...data };
                      newSecciones[idx] = { ...newSecciones[idx], lineas };
                      setSecciones(newSecciones);
                    }
                  }}
                  onDelete={() => {
                    onDeleteLinea(linea.id);
                  }}
                />
              ))}

              {/* Botón agregar línea */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-muted-foreground"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onAddLinea(seccion.id, seccion.lineas.length);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                + Agregar línea
              </Button>
            </div>
          </div>
        ))}

        <Separator className="my-2" />

        {/* Agregar nueva sección */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Agregar nueva sección:</p>
          <div className="flex gap-2 flex-wrap">
            {TIPOS_SECCION.map((tipo) => (
              <Button
                key={tipo}
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onAddSeccion(tipo);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                + {tipo}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
