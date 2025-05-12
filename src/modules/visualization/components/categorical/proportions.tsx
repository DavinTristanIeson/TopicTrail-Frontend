import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
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
    character,
  } = useCategoricalDataFrequencyModeState();

  const isAreaChart =
    item.config.display === VisualizationProportionsDisplayMode.AreaChart;
  const isBarChart =
    item.config.display === VisualizationProportionsDisplayMode.BarChart;
  const isHeatmap =
    item.config.display === VisualizationProportionsDisplayMode.Heatmap;
  if (!isAreaChart && !isBarChart && !isHeatmap) {
    throw new Error(
      `${item.config.display} is not a valid display mode for showing proportions of rows.`,
    );
  }

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
    const title = {
      text: `Proportions of ${item.column}`,
      subtitle: {
        text:
          isHeatmap && needsPercentage
            ? 'The values of each column sums up to 100%.'
            : undefined,
      },
    };

    if (isHeatmap) {
      const x = subdatasetNames;
      const y = uniqueValues;
      const z = uniqueValues.map((uniqueValue) => {
        return frequenciesPerSubdataset.map(
          (frequencies) => frequencies[uniqueValue] ?? 0,
        );
      });
      const valueLabel = needsPercentage ? 'Proportion' : 'Frequency';
      return {
        data: [
          {
            x,
            y,
            z,
            type: 'heatmap',
            colorscale: 'Greens',
            hovertemplate: [
              `<b>${item.column}</b>: %{y}`,
              `<b>Subdataset</b>: %{x}`,
              `<b>${valueLabel}</b>: %{z}${character}`,
            ].join('<br>'),
            texttemplate: needsPercentage ? '%{z:.2f}%' : '%{z}',
            zmin: 0,
            zmax: needsPercentage ? 100 : undefined,
            colorbar: {
              title: valueLabel,
            },
          },
        ],
        layout: {
          title,
          xaxis: {
            title: 'Subdatasets',
          },
          yaxis: {
            title: item.column,
          },
        },
      };
    } else {
      return {
        data: uniqueValues.map((uniqueValue, idx) => {
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
            hovertemplate: [
              `<b>${item.column}</b>: %{x}`,
              `<b>${needsPercentage ? 'Proportion' : 'Frequency'}</b>: %{y}${character}`,
            ].join('<br>'),
            marker: {
              color: colors[idx],
            },
          };
        }),
        layout: {
          title,
          xaxis: {
            title: 'Subdatasets',
          },
          yaxis: {
            ...plotlyLayoutProps,
            title:
              `Proportions of ${item.column}` + (needsPercentage ? ' (%)' : ''),
          },
          barmode: isBarChart ? 'stack' : undefined,
        },
      };
    }
  }, [
    character,
    data,
    isAreaChart,
    isBarChart,
    isHeatmap,
    item.column,
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
      {plot && (
        <PlotRenderer plot={plot} {...plotProps} scrollZoom={!isHeatmap} />
      )}
    </Stack>
  );
}
