import { DashboardItemModel } from '@/api/userdata';
import { useDebouncedValue } from '@mantine/hooks';
import { useId } from 'react';
import wordwrap from 'wordwrapjs';
export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}

export function usePlotRendererHelperProps(item: DashboardItemModel) {
  const id = useId();
  const [key] = useDebouncedValue(
    `${id}-${item.rect.width}-${item.rect.height}`,
    1000,
    {
      leading: false,
    },
  );
  return {
    key,
  };
}
