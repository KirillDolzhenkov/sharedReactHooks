import * as React       from 'react';
import { createPortal } from 'react-dom';

import './useClickTooltip.styles.css';

import { ClickTooltipEvent, UseClickTooltipTypes } from './useClickTooltip.types';

const useClickTooltip = function(values: UseClickTooltipTypes) {
  const {
          duration = 500,
          message,
        } = values;

  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = React.useCallback(
    (event: ClickTooltipEvent) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setOpen(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setOpen(false);
      }, duration);
    }, [duration]);

  const tooltip = open
    ? createPortal(
        <span
          className={'click-tooltip'}
          style={{
            left: position.x + 8,
            top:  position.y + 8,
          }}
        >
          {message}
        </span>,
        document.body,
    )
    : null;

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    show,
    tooltip,
  };

};

export default useClickTooltip;
