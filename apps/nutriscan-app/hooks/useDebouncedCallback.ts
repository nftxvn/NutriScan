import { useCallback, useRef } from 'react';

/**
 * A hook that returns a memoized callback which will only be executed
 * if it hasn't been called in the last `delay` milliseconds.
 * 
 * Useful for preventing double-taps on navigation buttons.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current > delay) {
        lastCall.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  );
}
