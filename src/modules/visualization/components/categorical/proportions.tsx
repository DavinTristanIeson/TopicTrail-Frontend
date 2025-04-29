import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { fromPairs, uniq, zip } from 'lodash-es';
import {
  VisualizationProportionsConfigType,
  VisualizationProportionsDisplayMode,
} from '../../configuration/proportions';
import { Stack, Select } from '@mantine/core';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
  useCategoricalDataFrequencyModeState,
} from '../configuration';

function getHoverTemplate(column: string, needsPercentage: boolean) {
  return `<b>${column}</b>: %{x}<br><b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{y}`;
}

export default function VisualizationProportionsComponent(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationProportionsConfigType
  >,
) {
  const { data, item } = props;
  // region Configuration
  const {
    transformFrequencies,
    plotlyLayoutProps,
    selectProps: frequencyModeSelectProps,
    needsPercentage,
  } = useCategoricalDataFrequencyModeState();

  // region Plot
  const plot = React.useMemo<PlotParams | undefined>(() => {
    const uniqueValues = uniq(
      data.flatMap((subdataset) => subdataset.data.categories),
    );
    if (data.length === 0 || uniqueValues.length === 0) return undefined;
    const { colors } = generateColorsFromSequence(uniqueValues);

    const frequenciesPerSubdataset = data.map((subdataset) => {
      return fromPairs(
        zip(
          subdataset.data.categories,
          transformFrequencies(subdataset.data.frequencies),
        ) as [string, number][],
      );
    });

    const subdatasetNames = data.map((subdataset) => subdataset.name);

    const isAreaChart =
      item.config.display === VisualizationProportionsDisplayMode.AreaChart;
    const isBarChart =
      item.config.display === VisualizationProportionsDisplayMode.BarChart;

    const subplots: PlotParams['data'] = uniqueValues.map(
      (uniqueValue, idx) => {
        const y = frequenciesPerSubdataset.map(
          (frequencies) => frequencies[uniqueValue] ?? 0,
        );
        return {
          name: uniqueValue,
          x: subdatasetNames,
          y: y,
          hoveron: isAreaChart ? 'points' : undefined,
          stackgroup: isAreaChart ? 'all' : undefined,
          type: isAreaChart ? 'scatter' : 'bar',
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
        title: `Proportions of ${item.column}`,
        yaxis: {
          ...plotlyLayoutProps,
        },
        barmode: isBarChart ? 'stack' : undefined,
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

  const plotProps = usePlotRendererHelperProps(item);

  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select {...frequencyModeSelectProps} />
      </PlotInlineConfiguration>
      {plot && <PlotRenderer plot={plot} {...plotProps} />}
    </Stack>
  );
}
