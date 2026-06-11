'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { parseAcordes } from '@/features/transpose/transpose';

const GRADOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const MODIFICADORES: { label: string; value: number }[] = [
  { label: 'Mayor', value: 0 },
  { label: 'm (menor)', value: 1 },
  { label: 'dim', value: 2 },
  { label: 'aug', value: 3 },
  { label: '7', value: 4 },
  { label: 'm7', value: 5 },
  { label: 'M7', value: 6 },
  { label: 'sus4', value: 7 },
  { label: 'add9', value: 8 },
];

interface LineEditorProps {
  id: string;
  letra: string;
  acordesRaw: string;
  orden: number;
  onUpdate: (data: { letra?: string; acordes_raw?: string; orden?: number }) => void;
  onDelete: () => void;
}

/**
 * Editor de una línea de canción.
 * Permite editar la letra y los acordes posicionados sobre ella.
 */
export default function LineEditor({
  letra,
  acordesRaw,
  orden,
  onUpdate,
  onDelete,
}: LineEditorProps) {
  const [texto, setTexto] = useState(letra);
  const [nuevoGrado, setNuevoGrado] = useState(1);
  const [nuevoMod, setNuevoMod] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const acordes = parseAcordes(acordesRaw);

  const handleLetraChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nuevoTexto = e.target.value;
      setTexto(nuevoTexto);
      onUpdate({ letra: nuevoTexto });
    },
    [onUpdate]
  );

  const handleAddAcorde = useCallback(() => {
    const raw = `${nuevoGrado}.${nuevoMod}.${cursorPos}`;
    const nuevosAcordes = acordesRaw ? `${acordesRaw} ${raw}` : raw;
    onUpdate({ acordes_raw: nuevosAcordes });
    setPopoverOpen(false);
  }, [nuevoGrado, nuevoMod, cursorPos, acordesRaw, onUpdate]);

  const handleRemoveAcorde = useCallback(
    (index: number) => {
      const nuevos = acordes.filter((_, i) => i !== index);
      const raw = nuevos
        .map((a) => `${a.grado}.${a.modificador}.${a.posicion}`)
        .join(' ');
      onUpdate({ acordes_raw: raw });
    },
    [acordes, onUpdate]
  );

  return (
    <div className="group relative flex items-start gap-2 py-1.5 border-b border-border/30 last:border-b-0">
      {/* Número de línea */}
      <span className="text-xs text-muted-foreground font-mono pt-2.5 w-6 text-right shrink-0 select-none">
        {orden + 1}
      </span>

      {/* Contenido editable */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Letra */}
        <input
          type="text"
          value={texto}
          onChange={handleLetraChange}
          placeholder="Letra..."
          className="w-full bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/40 outline-none border-b border-transparent focus:border-amber-500/30 transition-colors"
        />

        {/* Acordes posicionados */}
        {acordes.length > 0 && (
          <div className="relative font-mono text-xs" style={{ minHeight: '1.2em' }}>
            {acordes.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRemoveAcorde(i)}
                className="absolute top-0 px-0.5 rounded text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                style={{ left: `${a.posicion}ch` }}
                title={`Grado ${a.grado}, mod ${a.modificador} — click para eliminar`}
              >
                {GRADOS[a.grado - 1]}
                {a.modificador > 0 &&
                  MODIFICADORES.find((m) => m.value === a.modificador)?.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="shrink-0 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Popover para agregar acorde */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            type="button"
            className="inline-flex items-center justify-center hover:bg-muted hover:text-foreground h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs font-medium whitespace-nowrap transition-all outline-none select-none"
            title="Agregar acorde en posición del cursor"
          >
            +Acorde
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Posición del cursor en la letra:{' '}
                <span className="font-mono text-foreground">{cursorPos}</span>
              </p>

              {/* Grado */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Grado
                </label>
                <div className="flex gap-1 flex-wrap">
                  {GRADOS.map((g, i) => (
                    <Button
                      key={g}
                      type="button"
                      variant={nuevoGrado === i + 1 ? 'default' : 'outline'}
                      size="xs"
                      onClick={() => {
                        setNuevoGrado(i + 1);
                        setCursorPos(texto.length);
                      }}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Modificador */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Modificador
                </label>
                <div className="flex gap-1 flex-wrap">
                  {MODIFICADORES.map((m) => (
                    <Button
                      key={m.value}
                      type="button"
                      variant={nuevoMod === m.value ? 'default' : 'outline'}
                      size="xs"
                      onClick={() => setNuevoMod(m.value)}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Posición manual */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">
                  Posición:
                </label>
                <Input
                  type="number"
                  value={cursorPos}
                  onChange={(e) => setCursorPos(Number(e.target.value))}
                  className="w-20 h-7 text-xs font-mono"
                  min={0}
                />
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full"
                onClick={handleAddAcorde}
              >
                Agregar acorde
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Eliminar línea */}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
