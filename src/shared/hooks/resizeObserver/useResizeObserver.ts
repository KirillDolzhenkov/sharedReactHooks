import { useEffect } from 'react';

import type { UseResizeCallback } from './useResizeObserver.types';

/**
 * Observes size changes of a DOM element using the ResizeObserver API.
 *
 * @param {Element | null | undefined} element - DOM element to observe (usually from a React ref).
 *   When `null` or `undefined`, the hook does nothing.
 * @param {UseResizeCallback} [callback] - Called when the observed element's size changes.
 *   Receives a `ResizeObserverEntry` and the `ResizeObserver` instance.
 *
 * @example
 * const MyComponent = () => {
 *   const divRef = useRef<HTMLDivElement>(null);
 *
 *   useResize(divRef.current, (entry) => {
 *     const { width, height } = entry.contentRect;
 *     console.log(`Element size: ${width}px x ${height}px`);
 *   });
 *
 *   return (
 *     <div ref={divRef} style={{ width: '100px', height: '100px', resize: 'both', overflow: 'auto' }}>
 *       Resize me!
 *     </div>
 *   );
 * };
 */
function useResize(element?: Element | null, callback?: UseResizeCallback) {
  useEffect(() => {
    if (!element) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      for (const entry of entries) {
        callback?.(entry, observer);
      }
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [callback, element]);
}

export default useResize;
