declare module 'react-tooltip' {
  import React from 'react';

  export type TooltipProps = {
    id?: string;
    place?: 'top' | 'right' | 'bottom' | 'left';
    type?: 'dark' | 'success' | 'warning' | 'error' | 'info' | 'light';
    effect?: 'float' | 'solid';
    offset?: { top?: number; right?: number; bottom?: number; left?: number };
    padding?: string;
    multiline?: boolean;
    border?: boolean;
    className?: string;
    html?: boolean;
    delayHide?: number;
    delayShow?: number;
    delayUpdate?: number;
    event?: string;
    eventOff?: string;
    isCapture?: boolean;
    globalEventOff?: string;
    getContent?: ((dataTip: string) => React.ReactNode) | [((dataTip: string) => React.ReactNode), number];
    afterShow?: (event: React.MouseEvent<HTMLElement>) => void;
    afterHide?: (event: React.MouseEvent<HTMLElement>) => void;
    disable?: boolean;
    scrollHide?: boolean;
    resizeHide?: boolean;
    wrapper?: string;
    overridePosition?: (
      { left, top }: { left: number; top: number },
      currentEvent: React.MouseEvent<HTMLElement>,
      currentTarget: HTMLElement,
      node: HTMLElement,
      place: string,
      desiredPlace: string,
      effect: string,
      offset: { left: number; top: number }
    ) => { left: number; top: number };
    isMultiline?: boolean;
    clickable?: boolean;
    content?: React.ReactNode;
  };

  export class Tooltip extends React.Component<TooltipProps> {}
  export default Tooltip;
}
