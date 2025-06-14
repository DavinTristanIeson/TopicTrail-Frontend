import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack, NumberInput } from '@mantine/core';
import { PlotParams } from 'react-plotly.js';
import { BaseVisualizationComponentProps } from '../../types/base';
import { usePlotRendererHelperProps } from '../configuration';
import React from 'react';
import { DescriptiveStatisticsModel } from '@/api/table';
import { useDebouncedValue } from '@mantine/hooks';

export default function VisualizationContinuousDataDistributionMeanStdDotPlot(
  props: BaseVisualizationComponentProps<DescriptiveStatisticsModel, object>,
) {
  const { data, item } = props;
  const [stddev, setStddev] = React.useState<string | number>(2);
  const [debouncedStddev] = useDebouncedValue(stddev, 500, {
    leading: false,
  });
  const plot = React.useMemo<PlotParams>(() => {
    const stddev = typeof debouncedStddev === 'string' ? 0 : debouncedStddev;
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    return {
      data: [
        {
          x: data.map(({ name }) => name),
          y: data.map(({ data }) => data.mean),
          error_y: stddev
            ? {
                type: 'data',
                symmetric: true,
                array: data.map(({ data }) => data.std * stddev),
                visible: true,
              }
            : undefined,
          type: 'scatter',
          mode: 'text+markers',
          hovertemplate: [
            `<b>${item.column}</b>: %{x}`,
            '<b>Mean +- Std. Dev</b>: %{y}',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Mean and Standard Deviations of ${item.column}`,
        yaxis: {
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [data, debouncedStddev, item.column]);
  return (
    <Stack>
      <NumberInput
        min={0}
        label="Standard Deviations from Mean"
        onChange={setStddev}
        value={stddev}
      />
      <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}
