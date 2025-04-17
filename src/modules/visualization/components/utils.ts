import wordwrap from 'wordwrapjs';
export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}

export function plotlyCalculateGrid(width: number, count: number) {
  const cols = Math.max(3, Math.floor(width / 3));
  return {
    rows: Math.ceil(count / cols),
    cols,
  };
}
