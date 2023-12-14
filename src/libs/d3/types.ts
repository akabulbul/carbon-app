import { ScaleLinear } from 'd3';
import { SimulatorReturn } from 'libs/queries/extApi/simulator';
import { ReactNode, RefObject } from 'react';

export interface D3ChartProviderProps {
  children: ReactNode;
  dms: D3ChartSettings;
  data: D3ChartData;
  xScale: ScaleLinear<number, number>;
}

export interface D3ChartContext {
  svgRef: RefObject<SVGSVGElement>;
  dms: D3ChartSettings;
  data: D3ChartData;
  xScale: ScaleLinear<number, number>;
}

export type D3ChartData =
  | D3ChartCandlestickData[]
  | { time: number; value: number }[]
  | SimulatorReturn;

export interface D3ChartSettingsProps {
  width: number;
  height: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export interface D3ChartSettings extends Required<D3ChartSettingsProps> {
  boundedWidth: number;
  boundedHeight: number;
}

export type D3ChartCandlestickData = {
  date: number;
  volume: number;
  open: number;
  close: number;
  high: number;
  low: number;
};

export type Accessor<T> = (d: T) => number;
