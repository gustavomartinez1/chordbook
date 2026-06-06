'use client';

import { useEffect, useState } from 'react';

/**
 * Hook que retorna un valor debounced.
 * Útil para búsquedas en tiempo real sin saturar la DB.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
