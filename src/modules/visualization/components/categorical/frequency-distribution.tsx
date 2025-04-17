import { TableColumnFrequencyDistributionModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { VisualizationFrequencyDistributionConfigType } from '../../configuration/frequency-distribution';
import {
  CategoricalDataFrequencyMode,
  useCategoricalDataFrequencyMode,
} from './utils';

export function FrequencyDistributionBarChart(
  props: BaseVisualizationComponentProps<
    TableColumnFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { data, item } = props;
  const { transformFrequencies, plotlyLayoutProps } =
    useCategoricalDataFrequencyMode(item.config.mode);
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { frequencies, values } }, idx) => {
        const y = transformFrequencies(frequencies);
        return {
          name,
          x: values,
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
        ...plotlyLayoutProps,
        barmode: 'group',
      },
    };
  }, [data, plotlyLayoutProps, transformFrequencies]);
  return <PlotRenderer plot={plot} />;
}

export function FrequencyDistributionLinePlot(
  props: BaseVisualizationComponentProps<
    TableColumnFrequencyDistributionModel,
    Partial<VisualizationFrequencyDistributionConfigType>
  >,
) {
  const { data, item } = props;
  const { transformFrequencies, plotlyLayoutProps } =
    useCategoricalDataFrequencyMode(
      item.config?.mode ?? CategoricalDataFrequencyMode.Frequency,
    );
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { frequencies, values } }, idx) => {
        const y = transformFrequencies(frequencies);
        return {
          name,
          mode: 'lines+markers',
          x: values,
          y: y,
          type: 'scatter',
          marker: {
            color: colors[idx],
          },
        };
      },
    );
    return {
      data: subplots,
      layout: {
        xaxis: {
          ...plotlyLayoutProps,
        },
      },
    };
  }, [data, plotlyLayoutProps, transformFrequencies]);
  return <PlotRenderer plot={plot} />;
}
