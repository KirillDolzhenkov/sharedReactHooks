import { useEffect, useMemo, useRef } from 'react';

import type { ThrottledState, ThrottleOptions } from './useThrottleCallback.types.ts';

/**
 * Throttles a callback so it runs at most once every `delay` ms.
 *
 * - `leading` (default `true`) — run on the first call in a window
 * - `trailing` (default `true`) — run once more at the end of the window with the last args
 *
 * Returns the throttled function plus:
 * - `isPending()` — whether a trailing call is scheduled
 * - `cancel()` — clear the timer and reset the throttle window
 * - `flush()` — run immediately with the last pending args
 *
 * @template Args Tuple of arguments accepted by the function being throttled
 * @param {(...args: Args) => void} callback The function to throttle
 * @param {number} [delay=300] Throttle interval in milliseconds
 * @param {ThrottleOptions} [options]
 * @param {boolean} [options.leading=true] Execute on the leading edge
 * @param {boolean} [options.trailing=true] Execute on the trailing edge
 * @returns {ThrottledState<Args>} Throttled function with control methods
 *
 * @example
 * const handleScroll = useThrottleCallback(() => {
 *   console.log(window.scrollY);
 * }, 200);
 *
 * @example
 * const handleResize = useThrottleCallback(() => {
 *   recalculateLayout();
 * }, 100, { leading: false });
 *
 * if (handleResize.isPending()) handleResize.flush();
 * handleResize.cancel();
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useThrottleCallback<Args extends any[]>(
  callback: (...args: Args) => void,
  delay: number = 300,
  options: ThrottleOptions = {},
): ThrottledState<Args> {
  const { leading = true, trailing = true } = options;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastExecTimeRef = useRef(0);
  const pendingArgsRef = useRef<Args | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      pendingArgsRef.current = null;
    };
  }, [delay]);

  return useMemo(() => {
    const invoke = (args: Args) => {
      pendingArgsRef.current = null;
      Reflect.apply(callbackRef.current, undefined, args);
      lastExecTimeRef.current = Date.now();
    };

    const later = () => {
      lastExecTimeRef.current = leading ? Date.now() : 0;
      timerRef.current = null;

      if (trailing && pendingArgsRef.current != null) {
        const args = pendingArgsRef.current;

        pendingArgsRef.current = null;
        Reflect.apply(callbackRef.current, undefined, args);
      }
    };

    const throttled = (...args: Args) => {
      const now = Date.now();

      if (!leading && lastExecTimeRef.current === 0) {
        lastExecTimeRef.current = now;
      }

      const remaining = delay - (now - lastExecTimeRef.current);

      pendingArgsRef.current = args;

      if (remaining <= 0 || remaining > delay) {
        clearTimer();
        lastExecTimeRef.current = now;
        invoke(args);
        return;
      }

      if (timerRef.current == null && trailing) {
        timerRef.current = setTimeout(later, remaining);
      }
    };

    const func = throttled as ThrottledState<Args>;

    func.isPending = () => timerRef.current != null;

    func.cancel = () => {
      clearTimer();
      pendingArgsRef.current = null;
      lastExecTimeRef.current = 0;
    };

    func.flush = () => {
      if (pendingArgsRef.current == null) return;

      const args = pendingArgsRef.current;

      clearTimer();
      invoke(args);
    };

    return func;
  }, [delay, leading, trailing]);
}

export default useThrottleCallback;
