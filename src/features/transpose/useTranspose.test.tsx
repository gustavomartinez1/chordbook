import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranspose } from './useTranspose';

describe('useTranspose', () => {
  it('inicializa con el tono original', () => {
    const { result } = renderHook(() => useTranspose('C'));
    expect(result.current.tonalidadActual).toBe('C');
  });

  it('setTonalidad cambia la tonalidad', () => {
    const { result } = renderHook(() => useTranspose('C'));

    act(() => {
      result.current.setTonalidad('G');
    });

    expect(result.current.tonalidadActual).toBe('G');
  });

  it('transponer convierte raw a nombres en la tonalidad actual', () => {
    const { result } = renderHook(() => useTranspose('C'));

    // Grado 1 en C = C, Grado 4 en C = F
    const output = result.current.transponer('1.0.0 4.0.8');
    expect(output).toBe('C F');
  });

  it('transponer refleja cambio de tonalidad', () => {
    const { result } = renderHook(() => useTranspose('C'));

    act(() => {
      result.current.setTonalidad('G');
    });

    // Grado 1 en G = G, Grado 4 en G = C
    const output = result.current.transponer('1.0.0 4.0.8');
    expect(output).toBe('G C');
  });

  it('transponerConPosiciones retorna objetos con nombre, posicion y grado', () => {
    const { result } = renderHook(() => useTranspose('C'));

    const output = result.current.transponerConPosiciones('1.0.0 4.0.8');

    expect(output).toEqual([
      { nombre: 'C', posicion: 0, grado: 1 },
      { nombre: 'F', posicion: 8, grado: 4 },
    ]);
  });

  it('transponer retorna string vacío para raw vacío', () => {
    const { result } = renderHook(() => useTranspose('C'));
    expect(result.current.transponer('')).toBe('');
  });

  it('múltiples cambios de tonalidad sucesivos', () => {
    const { result } = renderHook(() => useTranspose('C'));

    act(() => { result.current.setTonalidad('G'); });
    expect(result.current.transponer('1.0.0')).toBe('G');

    act(() => { result.current.setTonalidad('D'); });
    expect(result.current.transponer('1.0.0')).toBe('D');

    act(() => { result.current.setTonalidad('F'); });
    expect(result.current.transponer('1.0.0')).toBe('F');
  });

  it('transponerConPosiciones con modificadores', () => {
    const { result } = renderHook(() => useTranspose('C'));

    const output = result.current.transponerConPosiciones('6.1.0 5.4.12');
    expect(output).toEqual([
      { nombre: 'Am', posicion: 0, grado: 6 },
      { nombre: 'G7', posicion: 12, grado: 5 },
    ]);
  });
});
