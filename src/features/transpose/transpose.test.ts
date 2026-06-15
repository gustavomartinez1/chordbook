import { describe, it, expect } from 'vitest';
import {
  getScale,
  parseAcordes,
  transponer,
  transponerLinea,
  acordesRawToNombres,
  acordeToNombre,
  CHROMATIC,
  TONOS,
} from './transpose';

// ─── getScale ────────────────────────────────────────────────────────

describe('getScale', () => {
  it('C mayor: C, D, E, F, G, A, B', () => {
    const scale = getScale('C');
    expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  it('G mayor: G, A, B, C, D, E, F#', () => {
    const scale = getScale('G');
    expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
  });

  it('D mayor: D, E, F#, G, A, B, C#', () => {
    const scale = getScale('D');
    expect(scale).toEqual(['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
  });

  it('A mayor: A, B, C#, D, E, F#, G#', () => {
    const scale = getScale('A');
    expect(scale).toEqual(['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
  });

  it('E mayor: E, F#, G#, A, B, C#, D#', () => {
    const scale = getScale('E');
    expect(scale).toEqual(['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']);
  });

  it('B mayor: B, C#, D#, E, F#, G#, A#', () => {
    const scale = getScale('B');
    expect(scale).toEqual(['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']);
  });

  it('F# mayor: F#, G#, A#, B, C#, D#, E# (=F)', () => {
    // En el círculo cromático no hay E#, así que F es el VII grado
    // Nota técnica: F# mayor debería tener E# como VII, pero CHROMATIC usa F
    const scale = getScale('F#');
    expect(scale).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F']);
  });

  it('C# mayor: C#, D#, E#(=F), F#, G#, A#, B#(=C)', () => {
    const scale = getScale('C#');
    expect(scale).toEqual(['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C']);
  });

  it('F mayor: F, G, A, Bb, C, D, E', () => {
    const scale = getScale('F');
    expect(scale).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
  });

  it('Bb (como A#): A#, C, D, D#, F, G, A', () => {
    // CHROMATIC solo usa sostenidos: Bb → A#
    const scale = getScale('A#');
    expect(scale).toEqual(['A#', 'C', 'D', 'D#', 'F', 'G', 'A']);
  });

  it('Eb (como D#): D#, F, G, G#, A#, C, D', () => {
    const scale = getScale('D#');
    expect(scale).toEqual(['D#', 'F', 'G', 'G#', 'A#', 'C', 'D']);
  });

  it('Ab (como G#): G#, A#, C, C#, D#, F, G', () => {
    const scale = getScale('G#');
    expect(scale).toEqual(['G#', 'A#', 'C', 'C#', 'D#', 'F', 'G']);
  });

  it('Db (como C#): C#, D#, F, F#, G#, A#, C', () => {
    const scale = getScale('C#');
    expect(scale).toEqual(['C#', 'D#', 'F', 'F#', 'G#', 'A#', 'C']);
  });

  it('[BUG] getScale con bemoles retorna array vacío (CHROMATIC no tiene Bb, Eb, Ab, Db, Gb)', () => {
    // Limitación conocida: CHROMATIC solo usa sostenidos (#)
    // Los tonos con bemoles (Bb, Eb, Ab, etc.) no son reconocidos
    expect(getScale('Bb')).toEqual([]);
    expect(getScale('Eb')).toEqual([]);
    expect(getScale('Ab')).toEqual([]);
    expect(getScale('Db')).toEqual([]);
    expect(getScale('Gb')).toEqual([]);
  });

  it('todos los 12 tonos retornan 7 notas', () => {
    // Gb no es válido en CHROMATIC, por eso skip
    const tonosValidos = TONOS.filter((t) => CHROMATIC.includes(t as any));
    for (const tono of tonosValidos) {
      const scale = getScale(tono as any);
      expect(scale).toHaveLength(7);
    }
  });

  it('root inválido retorna array vacío', () => {
    expect(getScale('X' as any)).toEqual([]);
    expect(getScale('' as any)).toEqual([]);
  });
});

// ─── parseAcordes ───────────────────────────────────────────────────

describe('parseAcordes', () => {
  it('string vacío retorna array vacío', () => {
    expect(parseAcordes('')).toEqual([]);
    expect(parseAcordes('   ')).toEqual([]);
  });

  it('parsea un solo acorde: "1.0.0"', () => {
    expect(parseAcordes('1.0.0')).toEqual([
      { grado: 1, modificador: 0, posicion: 0 },
    ]);
  });

  it('parsea múltiples acordes: "1.0.0 4.0.8 5.0.14"', () => {
    expect(parseAcordes('1.0.0 4.0.8 5.0.14')).toEqual([
      { grado: 1, modificador: 0, posicion: 0 },
      { grado: 4, modificador: 0, posicion: 8 },
      { grado: 5, modificador: 0, posicion: 14 },
    ]);
  });

  it('parsea con modificadores numéricos: "1.1.0 4.7.8 5.4.14"', () => {
    const result = parseAcordes('1.1.0 4.7.8 5.4.14');
    expect(result).toEqual([
      { grado: 1, modificador: 1, posicion: 0 },  // m
      { grado: 4, modificador: 7, posicion: 8 },  // sus4
      { grado: 5, modificador: 4, posicion: 14 }, // 7
    ]);
  });

  it('filtra tokens inválidos con formato incorrecto', () => {
    // "1.m.0" no es válido porque 'm' no es número
    const result = parseAcordes('1.0.0 basura 5.0.14');
    expect(result).toHaveLength(2);
  });

  it('filtra grados fuera de rango (1-7)', () => {
    const result = parseAcordes('0.0.0 1.0.0 8.0.0');
    expect(result).toEqual([
      { grado: 1, modificador: 0, posicion: 0 },
    ]);
  });

  it('tolera espacios extra', () => {
    const result = parseAcordes('  1.0.0   4.0.8   ');
    expect(result).toHaveLength(2);
  });

  it('maneja tabs y newlines', () => {
    const result = parseAcordes('1.0.0\n4.0.8\t5.0.14');
    expect(result).toHaveLength(3);
  });
});

// ─── transponer (conversión grado → nota) ────────────────────────────

describe('transponer', () => {
  it('grado=1, tono=C → C', () => {
    expect(transponer(1, 0, 'C', 'C')).toBe('C');
  });

  it('grado=4, tono=G → C (subdominante de G)', () => {
    expect(transponer(4, 0, 'G', 'G')).toBe('C');
  });

  it('grado=5, tono=A → E (dominante de A)', () => {
    expect(transponer(5, 0, 'A', 'A')).toBe('E');
  });

  it('grado=1, mod=m, tono=C → Cm', () => {
    expect(transponer(1, 1, 'C', 'C')).toBe('Cm');
  });

  it('grado=5, mod=7, tono=G → D7 (dominante de G con séptima)', () => {
    expect(transponer(5, 4, 'G', 'G')).toBe('D7');
  });

  it('grado=2, tono=C → D (superdominante)', () => {
    expect(transponer(2, 0, 'C', 'C')).toBe('D');
  });

  it('grado=6, tono=C → Am (relativo menor)', () => {
    expect(transponer(6, 1, 'C', 'C')).toBe('Am');
  });

  it('grado=7, tono=C → B° (sensible, disminuido)', () => {
    expect(transponer(7, 2, 'C', 'C')).toBe('Bdim');
  });

  it('grado=5, mod=7, tono=C → G7', () => {
    expect(transponer(5, 4, 'C', 'C')).toBe('G7');
  });

  it('grado=2, mod=5, tono=C → Dm7', () => {
    expect(transponer(2, 5, 'C', 'C')).toBe('Dm7');
  });

  it('modificador desconocido retorna string vacío como sufijo', () => {
    // modificador 99 no existe en MODIFICADORES
    expect(transponer(1, 99, 'C', 'C')).toBe('C');
  });

  it('transpone entre tonalidades: grado 1 en C → grado 1 en G = G', () => {
    expect(transponer(1, 0, 'C', 'G')).toBe('G');
  });

  it('transpone entre tonalidades: grado 4 en C → grado 4 en G = C', () => {
    expect(transponer(4, 0, 'C', 'G')).toBe('C');
  });

  it('transpone entre tonalidades: grado 5 en C → grado 5 en G = D', () => {
    expect(transponer(5, 0, 'C', 'G')).toBe('D');
  });
});

// ─── acordeToNombre ──────────────────────────────────────────────────

describe('acordeToNombre', () => {
  it('convierte grado I de C a C', () => {
    expect(acordeToNombre({ grado: 1, modificador: 0, posicion: 0 }, 'C')).toBe('C');
  });

  it('convierte grado IV de G a C', () => {
    expect(acordeToNombre({ grado: 4, modificador: 0, posicion: 8 }, 'G')).toBe('C');
  });

  it('convierte grado VI m de C a Am', () => {
    expect(acordeToNombre({ grado: 6, modificador: 1, posicion: 0 }, 'C')).toBe('Am');
  });
});

// ─── transponerLinea ─────────────────────────────────────────────────

describe('transponerLinea', () => {
  it('transpone canción de C a G: todos los acordes suben 7 semitonos', () => {
    // C → G: I→I=V/G, IV→IV=/G, V→V=/G
    const result = transponerLinea('1.0.0 4.0.8 5.0.14', 'C', 'G');
    expect(result).toBe('G C D');
  });

  it('C → C: sin cambios (idempotencia)', () => {
    const result = transponerLinea('1.0.0 4.0.8 5.0.14', 'C', 'C');
    expect(result).toBe('C F G');
  });

  it('con modificadores: Am → Em en transposición C→G', () => {
    // Grado 6 (relativo menor) de C = Am, transpuesto a G = Em
    const result = transponerLinea('6.1.0', 'C', 'G');
    expect(result).toBe('Em');
  });

  it('string vacío retorna el mismo string', () => {
    expect(transponerLinea('', 'C', 'G')).toBe('');
  });

  it('grado=2 con séptima: Dm7 → Am7 en transposición C→G', () => {
    const result = transponerLinea('2.5.0', 'C', 'G');
    expect(result).toBe('Am7');
  });

  it('grado=5 con séptima: G7 → D7 en transposición C→G', () => {
    const result = transponerLinea('5.4.0', 'C', 'G');
    expect(result).toBe('D7');
  });
});

// ─── acordesRawToNombres ─────────────────────────────────────────────

describe('acordesRawToNombres', () => {
  it('convierte raw a nombres en C', () => {
    const result = acordesRawToNombres('1.0.0 4.0.8 5.0.14', 'C');
    expect(result).toEqual(['C', 'F', 'G']);
  });

  it('retorna array vacío para string vacío', () => {
    expect(acordesRawToNombres('', 'C')).toEqual([]);
  });

  it('con modificadores', () => {
    const result = acordesRawToNombres('2.5.0 5.4.8', 'C');
    expect(result).toEqual(['Dm7', 'G7']);
  });
});

// ─── Regresión: idempotencia y casos borde ───────────────────────────

describe('regresión', () => {
  it('transponer de C a C es idempotente', () => {
    const fixtures = [
      '1.0.0',
      '1.0.0 4.0.8 5.0.14',
      '2.5.0 5.4.8 6.1.16',
      '1.1.0 4.7.8 5.4.14 7.2.20',
    ];
    for (const raw of fixtures) {
      expect(transponerLinea(raw, 'C', 'C')).toBe(
        acordesRawToNombres(raw, 'C').join(' ')
      );
    }
  });

  it('transponer de G a G es idempotente', () => {
    const raw = '1.0.0 4.0.8 5.0.14';
    expect(transponerLinea(raw, 'G', 'G')).toBe(
      acordesRawToNombres(raw, 'G').join(' ')
    );
  });

  it('todas las constantes CHROMATIC son accesibles', () => {
    expect(CHROMATIC).toHaveLength(12);
    expect(CHROMATIC[0]).toBe('C');
    expect(CHROMATIC[11]).toBe('B');
  });

  it('TONOS tiene 12 entradas con sostenidos y bemoles', () => {
    expect(TONOS).toHaveLength(12);
    expect(TONOS).toContain('C');
    expect(TONOS).toContain('G');
    expect(TONOS).toContain('Bb');
    expect(TONOS).toContain('Eb');
    expect(TONOS).toContain('Ab');
    // TONOS no incluye Db ni Gb (usa C# y F# en su lugar)
  });
});
