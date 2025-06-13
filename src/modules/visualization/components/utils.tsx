import { zip, unzip } from 'lodash-es';
import wordwrap from 'wordwrapjs';

export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}

export function getConfidenceIntervalOffsets(
  values: number[],
  errors: [number, number][],
) {
  const [arrayminus, arrayplus] = unzip(
    zip(values, errors).map(([coefficient, interval]) => {
      if (interval![0] == null || interval![1] == null) {
        return [undefined, undefined];
      }
      return [
        // value - lower
        coefficient! - interval![0],
        // upper - value
        interval![1] - coefficient!,
      ];
    }),
  );
  return {
    type: 'data',
    symmetric: false,
    array: arrayplus,
    arrayminus: arrayminus,
    visible: true,
  };
}
