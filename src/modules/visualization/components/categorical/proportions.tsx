import { VisualizationFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { VisualizationFrequencyDistributionConfigType } from '../../configuration/frequency-distribution';
import { useCategoricalDataFrequencyMode } from './utils';
import { fromPairs, zip } from 'lodash-es';

export function ProportionStackedBarChart(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { data, item } = props;
  const { plotlyLayoutProps, transformFrequencies } =
    useCategoricalDataFrequencyMode(item.config.mode);
  const plot = React.useMemo<PlotParams>(() => {
    const uniqueValuesTracker: Set<string> = new Set();
    for (const subdataset of data) {
      for (const value of subdataset.data.categories) {
        uniqueValuesTracker.add(value);
      }
    }
    const uniqueValues = Array.from(uniqueValuesTracker);
    const { colors } = generateColorsFromSequence(uniqueValues);

    const frequenciesPerSubdataset = data.map((subdataset) =>
      fromPairs(
        zip(
          subdataset.data.categories,
          transformFrequencies(subdataset.data.frequencies),
        ) as [string, number][],
      ),
    );

    const subdatasetNames = data.map((subdataset) => subdataset.name);

    const subplots: PlotParams['data'] = uniqueValues.map(
      (uniqueValue, idx) => {
        const y = frequenciesPerSubdataset.map(
          (frequencies) => frequencies[uniqueValue] ?? 0,
        );
        return {
          name: uniqueValue,
          x: subdatasetNames,
          y: y,
          type: 'bar',
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
        xaxis: {
          ...plotlyLayoutProps,
        },
        barmode: 'stack',
      },
    };
  }, [data, item.column, plotlyLayoutProps, transformFrequencies]);
  return <PlotRenderer plot={plot} />;
}
