/**
 * Motor de transposición para CHORDBOOK
 *
 * Convierte acordes en notación numérica (I-VII) a nombres reales
 * según el tono seleccionado, permitiendo transposición automática.
 */

// ─── Constantes ────────────────────────────────────────────────────

/** Las 12 notas del círculo cromático en orden */
export const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type ChromaticNote = (typeof CHROMATIC)[number];

/** Los 12 tonos mayores */
export const TONOS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'] as const;

export type Tono = (typeof TONOS)[number];

/** Intervalos de la escala mayor en semitonos: I=0, II=2, III=4, IV=5, V=7, VI=9, VII=11 */
export const SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;

// ─── Tipos ─────────────────────────────────────────────────────────

export interface AcordeRaw {
  grado: number;       // 1-7
  modificador: number; // 0=none, 1=m, 2=dim, 3=aug, 4=7, 5=m7, 6=M7, 7=sus4, 8=add9, etc.
  posicion: number;    // offset en caracteres
}

// ─── Funciones de escala ───────────────────────────────────────────

/**
 * Devuelve las 7 notas de la escala mayor para una tónica dada.
 * Ejemplo: getScale('C') → ['C','D','E','F','G','A','B']
 */
export function getScale(root: ChromaticNote): string[] {
  const rootIndex = CHROMATIC.indexOf(root);
  if (rootIndex === -1) return [];

  return SCALE_INTERVALS.map((interval) => {
    const idx = (rootIndex + interval) % 12;
    return CHROMATIC[idx];
  });
}

// ─── Mapa de tonos a su nota raíz ────────────────────────────────

/**
 * Obtiene la nota raíz (tónica) de un tono mayor.
 * En el círculo de quintas, C=0, G=7, D=2, A=9, etc.
 * Se mapea cada tono a su índice cromático.
 */
function tonoToRootIndex(tono: Tono): number {
  const MAPA_TONO_RAIZ: Record<string, number> = {
    'C': 0,
    'G': 7,
    'D': 2,
    'A': 9,
    'E': 4,
    'B': 11,
    'F#': 6,
    'C#': 1,
    'F': 5,
    'Bb': 10,
    'Eb': 3,
    'Ab': 8,
  };
  return MAPA_TONO_RAIZ[tono] ?? 0;
}

// ─── Modificadores de acordes ──────────────────────────────────────

const MODIFICADORES: Record<number, string> = {
  0: '',    // Mayor
  1: 'm',   // menor
  2: 'dim', // disminuido
  3: 'aug', // aumentado
  4: '7',   // séptima
  5: 'm7',  // menor séptima
  6: 'M7',  // mayor séptima
  7: 'sus4',// suspendido 4
  8: 'add9',// add 9
};

// ─── Funciones principales ─────────────────────────────────────────

/**
 * Parsea una cadena de acordes_raw en un array de AcordeRaw
 * Formato: "GRADO.MODIFICADOR.POSICION GRADO.MODIFICADOR.POSICION"
 * Ejemplo: "1.0.0 4.0.8 5.0.14"
 */
export function parseAcordes(raw: string): AcordeRaw[] {
  if (!raw || raw.trim() === '') return [];

  return raw
    .trim()
    .split(/\s+/)
    .map((token) => {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const grado = parseInt(parts[0], 10);
      const modificador = parseInt(parts[1], 10);
      const posicion = parseInt(parts[2], 10);

      if (isNaN(grado) || isNaN(modificador) || isNaN(posicion)) return null;
      if (grado < 1 || grado > 7) return null;

      return { grado, modificador, posicion };
    })
    .filter((a): a is AcordeRaw => a !== null);
}

/**
 * Transpone un grado + modificador de un tono origen a un tono destino.
 * Devuelve el nombre del acorde en el tono destino.
 *
 * @param grado - Grado de la escala (1-7, donde 1=I, 2=II, ..., 7=VII)
 * @param mod - Modificador (0=Mayor, 1=m, 4=7, etc.)
 * @param tonoOrigen - Tono original de la canción
 * @param tonoDestino - Tono al que se desea transponer
 * @returns Nombre del acorde transpuesto (ej: "G", "Am", "D7")
 */
export function transponer(
  grado: number,
  mod: number,
  tonoOrigen: Tono,
  tonoDestino: Tono
): string {
  // Calcular la nota raíz del tono destino
  const rootIndex = tonoToRootIndex(tonoDestino);

  // El grado I en el tono destino es la nota raíz
  // Aplicar intervalo de la escala mayor para el grado
  const semitonoGrado = (rootIndex + SCALE_INTERVALS[grado - 1]) % 12;
  const notaBase = CHROMATIC[semitonoGrado];
  const sufijo = MODIFICADORES[mod] ?? '';

  return `${notaBase}${sufijo}`;
}

/**
 * Convierte un AcordeRaw a su representación en un tono específico.
 */
export function acordeToNombre(acorde: AcordeRaw, tono: Tono): string {
  return transponer(acorde.grado, acorde.modificador, tono, tono);
}

/**
 * Transpone una cadena de acordes_raw de un tono origen a un tono destino.
 * Devuelve una cadena con los acordes transpuestos en formato legible.
 */
export function transponerLinea(
  acordesRaw: string,
  tonoOrigen: Tono,
  tonoDestino: Tono
): string {
  const acordes = parseAcordes(acordesRaw);
  if (acordes.length === 0) return acordesRaw;

  return acordes
    .map((a) => transponer(a.grado, a.modificador, tonoOrigen, tonoDestino))
    .join(' ');
}

/**
 * Convierte acordes_raw a array de nombres de acordes en un tono específico.
 */
export function acordesRawToNombres(acordesRaw: string, tono: Tono): string[] {
  const acordes = parseAcordes(acordesRaw);
  return acordes.map((a) => acordeToNombre(a, tono));
}
