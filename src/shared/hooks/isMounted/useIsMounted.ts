import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable function that reports whether the component is currently mounted.
 *
 * Handy for ignoring async results after unmount (e.g. skipping state updates from a finished request).
 *
 * @returns {() => boolean} A function that returns `true` while the component is mounted.
 *
 * @example
 * const MyComponent = () => {
 *   const isMounted = useIsMounted();
 *
 *   useEffect(() => {
 *     fetchUser().then((user) => {
 *       if (!isMounted()) return;
 *       setUser(user);
 *     });
 *   }, [isMounted]);
 *
 *   return null;
 * };
 */
function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

export default useIsMounted;
