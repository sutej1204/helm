declare module 'react-simple-maps' {
  import * as React from 'react';

  export type ProjectionConfigProp = {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
    parallels?: [number, number];
  };

  export type ComposableMapProps = {
    projection?: string;
    projectionConfig?: ProjectionConfigProp;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  };

  export type ZoomableGroupProps = {
    zoom?: number;
    center?: [number, number];
    maxZoom?: number;
    minZoom?: number;
    translateXExtent?: [number, number];
    translateYExtent?: [number, number];
    onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (position: { coordinates: [number, number]; zoom: number; dragging: boolean }) => void;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    onZoomStart?: (event: React.MouseEvent | React.TouchEvent) => void;
    onZoom?: (zoom: number) => void;
    onZoomEnd?: (zoom: number) => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  };

  export type GeographiesProps = {
    geography: any;
    children: (args: { geographies: any[] }) => React.ReactNode;
    parseGeographies?: (features: any) => any[];
    className?: string;
    style?: React.CSSProperties;
  };

  export type GeographyProps = {
    geography: any;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    onMouseUp?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
    [key: string]: any;
  };

  export type MarkerProps = {
    coordinates: [number, number];
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    onMouseUp?: (event: React.MouseEvent) => void;
    onMouseMove?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  };

  export function ComposableMap(props: ComposableMapProps): JSX.Element;
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
  export function Geographies(props: GeographiesProps): JSX.Element;
  export function Geography(props: GeographyProps): JSX.Element;
  export function Marker(props: MarkerProps): JSX.Element;
}
