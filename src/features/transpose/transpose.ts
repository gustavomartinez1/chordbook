/**
 * Motor de transposición para CHORDBOOK
 *
 * Convierte acordes en notación numérica (I-VII) a nombres reales
 * según el tono seleccionado, permitiendo transposición automática.
 */

// Los 12 tonos mayores en orden de quintas (círculo cromático)
export const TONOS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'] as const;

export type Tono = (typeof TONOS)[number];

// Mapas de grados para cada tipo de acorde
export const MAPA_GRADOS: Record<number, number[]> = {
  0: [0, 2, 4, 5, 7, 9, 11],  // Mayor natural
};

export interface AcordeRaw {
  grado: number;       // 1-7
  modificador: number; // 0=none, 1=m, 2=dim, 3=aug, 4=7, 5=m7, 6=M7, 7=sus4, 8=add9, etc.
  posicion: number;    // offset en caracteres
}

// Sufijos de modificadores de acordes
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
 * Convierte un AcordeRaw a su representación en un tono específico
 */
export function acordeToNombre(acorde: AcordeRaw, tono: Tono): string {
  const tonoIndex = TONOS.indexOf(tono);
  if (tonoIndex === -1) return '?';

  // Encontrar la nota base para este grado en este tono
  // La nota base del grado I en el tono dado es el tono mismo
  // Grados de la escala mayor: I=0, II=2, III=4, IV=5, V=7, VI=9, VII=11 semitonos
  const GRADOS_SEMITONOS = [0, 2, 4, 5, 7, 9, 11];
  const semitonosBase = TONOS[tonoIndex];
  const semitonoIndex = TONOS.indexOf(semitonosBase);
  const semitonoGrado = (semitonoIndex + GRADOS_SEMITONOS[acorde.grado - 1]) % 12;

  const notaBase = TONOS[semitonoGrado];
  const sufijo = MODIFICADORES[acorde.modificador] ?? '';

  return `${notaBase}${sufijo}`;
}

/**
 * Transpone una cadena de acordes_raw de un tono origen a un tono destino
 * Devuelve una cadena con los acordes transpuestos en formato legible
 */
export function transponerLinea(
  acordesRaw: string,
  tonoOrigen: Tono,
  tonoDestino: Tono
): string {
  const acordes = parseAcordes(acordesRaw);
  if (acordes.length === 0) return acordesRaw;

  // Si el tono destino es igual al origen, transpone igual (es el mismo resultado)
  // pero calculamos sobre el tono destino
  return acordes
    .map((a) => acordeToNombre(a, tonoDestino))
    .join(' ');
}

/**
 * Convierte acordes_raw a array de nombres de acordes en un tono específico
 */
export function acordesRawToNombres(acordesRaw: string, tono: Tono): string[] {
  const acordes = parseAcordes(acordesRaw);
  return acordes.map((a) => acordeToNombre(a, tono));
}
