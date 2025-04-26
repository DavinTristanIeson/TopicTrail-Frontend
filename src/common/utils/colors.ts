/* eslint-disable import/no-named-as-default-member */
import chroma from 'chroma-js';
import { uniq } from 'lodash-es';

const DISCRETE_PLOT_COLORS: string[] = chroma.brewer.Dark2;

export function getPlotColor(seed: number) {
  return DISCRETE_PLOT_COLORS[seed % DISCRETE_PLOT_COLORS.length];
}

export function getTextColorBasedOnContrast(color: string) {
  return chroma.contrast(color, 'white') <= 4.5 ? 'black' : 'white';
}

interface GenerateColorsFromSequenceOptions {
  partialColorMap: Map<any, string>;
}

export function generateColorsFromSequence(
  sequence: any[],
  options?: GenerateColorsFromSequenceOptions,
) {
  const uniqueValues = uniq(sequence);
  const colorMap = new Map(
    uniqueValues.map((value, index) => {
      if (options?.partialColorMap && options.partialColorMap.has(value)) {
        return [value, options.partialColorMap.get(value)];
      }
      return [value, getPlotColor(index)];
    }),
  );
  const colors = sequence.map((item) => colorMap.get(item)!);
  return {
    colorMap,
    colors,
  };
}
