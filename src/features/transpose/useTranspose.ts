'use client';

import { useState, useCallback } from 'react';
import { parseAcordes, acordeToNombre, type Tono } from './transpose';

/**
 * Hook que transpone acordes del sistema numérico al tono seleccionado.
 *
 * @param tonoOriginal - Tono en que fue escrita la canción (e.g. "C", "G")
 * @param tonalidadActual - Tono actualmente seleccionado (por defecto = tonoOriginal)
 */
export function useTranspose(tonoOriginal: string) {
  const [tonalidadActual, setTonalidad] = useState<Tono>(tonoOriginal as Tono);

  const transponer = useCallback(
    (acordesRaw: string): string => {
      const acordes = parseAcordes(acordesRaw);
      if (acordes.length === 0) return '';
      return acordes
        .map((a) => acordeToNombre(a, tonalidadActual as Tono))
        .join(' ');
    },
    [tonalidadActual]
  );

  const transponerConPosiciones = useCallback(
    (
      acordesRaw: string
    ): Array<{ nombre: string; posicion: number; grado: number }> => {
      const acordes = parseAcordes(acordesRaw);
      return acordes.map((a) => ({
        nombre: acordeToNombre(a, tonalidadActual as Tono),
        posicion: a.posicion,
        grado: a.grado,
      }));
    },
    [tonalidadActual]
  );

  return {
    tonalidadActual,
    setTonalidad,
    transponer,
    transponerConPosiciones,
  };
}
