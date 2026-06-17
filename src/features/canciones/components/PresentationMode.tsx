'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import ToneSelector from './ToneSelector';
import type { CancionCompleta, SeccionConLineas } from '@/shared/types/supabase';

interface PresentationModeProps {
  cancion: CancionCompleta;
  tonalidadActual: string;
  tonoOriginal: string;
  onExit: () => void;
}

/**
 * Modo presentación fullscreen para escenario.
 * - Fondo negro
 * - Letra grande (text-4xl)
 * - Acordes enormes (text-5xl) encima de la letra
 * - Navegación con teclado (flechas)
 * - Scroll automático
 */
export default function PresentationMode({
  cancion,
  tonalidadActual,
  onExit,
  ..._props
}: PresentationModeProps) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentTonalidad, setCurrentTonalidad] = useState(tonalidadActual);
  const containerRef = useRef<HTMLDivElement>(null);

  const secciones = cancion.secciones.filter(
    (s) => s.lineas.length > 0
  );
  const currentSection: SeccionConLineas | null =
    secciones[currentSectionIdx] ?? null;

  // Navegación por teclado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onExit();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          setCurrentSectionIdx((prev) =>
            Math.min(prev + 1, secciones.length - 1)
          );
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setCurrentSectionIdx((prev) => Math.max(prev - 1, 0));
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, secciones.length]);

  // Scroll automático al cambiar de sección
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIdx]);

  if (!currentSection) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Sin contenido para mostrar</p>
        <Button
          variant="outline"
          className="absolute top-4 right-4"
          onClick={onExit}
        >
          Salir
        </Button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      ref={containerRef}
    >
      {/* Barra superior */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white/90">
            {cancion.titulo}
          </h2>
          {cancion.artista && (
            <span className="text-sm text-white/50">{cancion.artista}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ToneSelector
            value={currentTonalidad}
            onChange={setCurrentTonalidad}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="text-white/80 border-white/20 hover:bg-white/10"
          >
            Salir (Esc)
          </Button>
        </div>
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        {/* Indicador de sección */}
        <div className="mb-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/70">
            {currentSection.nombre}
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {secciones.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSectionIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSectionIdx
                    ? 'bg-amber-400 w-6'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Líneas */}
        <div className="w-full max-w-4xl space-y-8">
          {currentSection.lineas.map((linea) => (
            <PresentationLine
              key={linea.id}
              letra={linea.letra ?? ''}
              acordesRaw={linea.acordes_raw ?? ''}
              tonalidad={currentTonalidad}
            />
          ))}
        </div>
      </div>

      {/* Navegación inferior */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/80 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentSectionIdx === 0}
          onClick={() => setCurrentSectionIdx((p) => p - 1)}
          className="text-white/60 hover:text-white"
        >
          ← Anterior
        </Button>

        <span className="text-xs text-white/40 font-mono">
          {currentSectionIdx + 1} / {secciones.length}
        </span>

        <Button
          variant="ghost"
          size="sm"
          disabled={currentSectionIdx === secciones.length - 1}
          onClick={() => setCurrentSectionIdx((p) => p + 1)}
          className="text-white/60 hover:text-white"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}

/* ─── Línea individual en modo presentación ─── */
import { parseAcordes, acordeToNombre, type Tono } from '@/features/transpose/transpose';

function PresentationLine({
  letra,
  acordesRaw,
  tonalidad,
}: {
  letra: string;
  acordesRaw: string;
  tonalidad: string;
}) {
  const acordes = parseAcordes(acordesRaw).map((a) => ({
    nombre: acordeToNombre(a, tonalidad as Tono),
    posicion: a.posicion,
    grado: a.grado,
  }));

  const COLORES_GRADO: Record<number, string> = {
    1: 'text-[#f5c542]',
    2: 'text-[#e8a040]',
    3: 'text-[#d4a545]',
    4: 'text-[#c09430]',
    5: 'text-[#b8860b]',
    6: 'text-[#a07020]',
    7: 'text-[#8b6914]',
  };

  if (!letra && acordes.length === 0) return null;

  return (
    <div className="font-mono leading-relaxed text-center">
      {/* Acordes */}
      <div className="relative h-12">
        {acordes.map((acorde, i) => (
          <span
            key={i}
            className={`absolute font-bold ${COLORES_GRADO[acorde.grado] ?? 'text-amber-400'}`}
            style={{
              left: `${acorde.posicion}ch`,
              fontSize: '3rem',
              lineHeight: 1.2,
              textShadow: '0 0 12px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {acorde.nombre}
          </span>
        ))}
      </div>
      {/* Letra */}
      <div
        className="text-white/90 font-light"
        style={{ fontSize: '2.25rem', lineHeight: 1.4 }}
      >
        {letra || '\u00A0'}
      </div>
    </div>
  );
}
