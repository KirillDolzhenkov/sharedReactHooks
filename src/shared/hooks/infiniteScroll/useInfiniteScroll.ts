import { useEffect } from 'react';

import { IUseInfiniteScroll } from './useInfiniteScroll.types.ts';

/**
 * Custom hook for implementing infinite scroll.
 *
 * @param {IUseInfiniteScroll} props - Configuration object for infinite scroll settings.
 * @param {Function} [props.callBack] - Function that will be called when the user scrolls near the bottom of the page.
 * @param {number} [props.distanceToBottom=100] - Distance in pixels from the bottom of the page at which the callBack is triggered. Defaults to 100 pixels.
 *
 * @example
 * const MyComponent = () => {
 *   useInfiniteScroll({
 *     callBack: () => console.log('Reached the bottom!'),
 *     distanceToBottom: 200
 *   });
 *
 *   return (
 *     <div>
 *       <p>Scroll down to see the magic happen!</p>
 *     </div>
 *   );
 * };
 */

const useInfiniteScroll = (props: IUseInfiniteScroll) => {
  const { callBack, distanceToBottom = 100 } = props;

  useEffect(() => {
    const handleScroll = () => {
      const TOTAL_PAGE_HEIGHT = document.documentElement.scrollHeight;
      const CURRENT_DISTANCE_FROM_TOP = document.documentElement.scrollTop;
      const VISIBLE_REGION = window.innerHeight;

      if (TOTAL_PAGE_HEIGHT - (VISIBLE_REGION + CURRENT_DISTANCE_FROM_TOP) < distanceToBottom) {
        callBack?.();
      }
    };

    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [distanceToBottom, callBack]);
};

export default useInfiniteScroll;