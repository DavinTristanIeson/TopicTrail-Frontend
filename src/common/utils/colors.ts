/* eslint-disable import/no-named-as-default-member */
import chroma from 'chroma-js';

const DISCRETE_PLOT_COLORS: string[] = chroma.brewer.Dark2;

export function getPlotColor(seed: number) {
  return DISCRETE_PLOT_COLORS[seed % DISCRETE_PLOT_COLORS.length];
}

export function getTextColorBasedOnContrast(color: string) {
  return chroma.contrast(color, 'white') <= 4.5 ? 'black' : 'white';
}
