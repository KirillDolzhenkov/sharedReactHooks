import { useId } from 'react';

/**
 * Returns a stable DOM id — uses the provided `id` when given, otherwise falls back to React's `useId()`.
 *
 * Useful for form controls and accessibility attributes when an explicit id is optional.
 *
 * @param {string} [id] - Optional id to use instead of a generated one.
 * @returns {string} The provided id, or a React-generated unique id.
 *
 * @example
 * const MyInput = ({ id }: { id?: string }) => {
 *   const inputId = useAutoId(id);
 *
 *   return (
 *     <>
 *       <label htmlFor={inputId}>Name</label>
 *       <input id={inputId} />
 *     </>
 *   );
 * };
 */
const useAutoId = (id?: string): string => {
  const generatedId = useId();

  return id ?? generatedId;
};

export default useAutoId;
