import { useMemo, useRef, useEffect } from 'react';
import type { DebouncedState }        from './useDebounceCallback.types.ts';

/**
 * Custom hook for debouncing a function — delays its execution until a specified
 * number of milliseconds have passed since the last time it was invoked.
 *
 * Returns a wrapped function with additional control methods:
 * - `isPending()` — checks whether a debounced call is currently scheduled
 * - `cancel()`    — cancels the scheduled call
 * - `flush()`     — immediately executes the function (if it was scheduled)
 *
 * @template Args Tuple of arguments accepted by the function being debounced
 * @param {(...args: Args) => void} callback The function to debounce
 * @param {number} [delay=300] Delay in milliseconds
 * @returns {DebouncedState<Args>} Debounced function with control methods
 *
 * @example
 * const debouncedSearch = useDebounceCallback((query: string) => {
 *   fetchUsers(query);
 * }, 500);
 *
 * // Calls will be delayed by 500 ms
 * debouncedSearch('react');
 * debouncedSearch('react hook'); // previous call will be cancelled
 *
 * if (debouncedSearch.isPending()) {
 *   console.log('Request has not been sent yet...');
 *   debouncedSearch.flush(); // send immediately
 * }
 *
 * debouncedSearch.cancel(); // cancel completely
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebounceCallback<Args extends any[]>(
  callback: (...args: Args) => void,
  delay = 300,
): DebouncedState<Args> {
  const timerRef    = useRef<null | ReturnType<typeof setTimeout>>(null);
  const argsRef     = useRef<Args | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delay]);

  return useMemo(() => {
    const debounced = (...args: Args) => {
      argsRef.current = args;

      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const argsToUse = argsRef.current;
        argsRef.current = null;

        if (argsToUse != null) {
          Reflect.apply(callbackRef.current, undefined, argsToUse);
        }
      }, delay);
    };

    const func = debounced as DebouncedState<Args>;

    func.isPending = () => {
      return !!timerRef.current;
    };

    func.cancel = () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    func.flush = () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (argsRef.current != null) {
        const args = argsRef.current;
        argsRef.current = null;
        Reflect.apply(callbackRef.current, undefined, args);
      }
    };

    return func;
  }, [delay]);
}

export default useDebounceCallback;
