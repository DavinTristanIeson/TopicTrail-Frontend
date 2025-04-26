import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  VisualizationFrequencyDistributionConfigType,
  VisualizationFrequencyDistributonDisplayMode,
} from '../../configuration/frequency-distribution';
import { Select, Stack } from '@mantine/core';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
  useCategoricalDataFrequencyModeState,
} from '../configuration';

function getHoverTemplate(column: string, needsPercentage: boolean) {
  return `<b>${column}</b>: %{x}<br><b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{y}`;
}

export default function VisualizationFrequencyDistributionComponent(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { data, item } = props;
  const {
    transformFrequencies,
    plotlyLayoutProps,
    selectProps,
    needsPercentage,
  } = useCategoricalDataFrequencyModeState();

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );

    const isBarChart =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.BarChart;
    const isLinePlot =
      item.config.display ===
      VisualizationFrequencyDistributonDisplayMode.LinePlot;

    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { frequencies, categories } }, idx) => {
        const y = transformFrequencies(frequencies);
        return {
          name,
          mode: 'lines+markers',
          x: categories,
          y: y,
          type: isLinePlot ? 'scatter' : 'bar',
          hovertemplate: getHoverTemplate(item.column, needsPercentage),
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        title: `Frequency Distribution of ${item.column}`,
        yaxis: {
          ...plotlyLayoutProps,
        },
        barmode: isBarChart ? 'group' : undefined,
      },
    };
  }, [
    data,
    item.column,
    item.config.display,
    needsPercentage,
    plotlyLayoutProps,
    transformFrequencies,
  ]);

  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select {...selectProps} />
      </PlotInlineConfiguration>
      <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}
