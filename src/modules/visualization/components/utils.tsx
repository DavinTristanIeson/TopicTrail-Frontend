import wordwrap from 'wordwrapjs';

export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}
