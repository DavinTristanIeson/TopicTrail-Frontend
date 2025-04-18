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
import {
  CategoricalDataFrequencyMode,
  useCategoricalDataFrequencyMode,
} from './utils';
import { usePlotRendererHelperProps } from '../utils';
import { DashboardItemModel } from '@/api/userdata';

function getHoverTemplate(
  item: DashboardItemModel<VisualizationFrequencyDistributionConfigType>,
) {
  return `<b>${item.column}</b>: %{x}<br><b>${item.config.mode === CategoricalDataFrequencyMode.Proportion ? 'Proportion' : 'Frequency'}</b>: %{y}`;
}

export function VisualizationFrequencyDistributionBarChart(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
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
      ({ name, data: { frequencies, categories } }, idx) => {
        const y = transformFrequencies(frequencies);
        return {
          name,
          x: categories,
          y: y,
          hovertemplate: getHoverTemplate(item),
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
        title: `Frequency Distribution of ${item.column}`,
        yaxis: {
          ...plotlyLayoutProps,
        },
        barmode: 'group',
      },
    };
  }, [data, item.column, plotlyLayoutProps, transformFrequencies]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationFrequencyDistributionLinePlot(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { data, item } = props;
  const { transformFrequencies, plotlyLayoutProps } =
    useCategoricalDataFrequencyMode(item.config?.mode);
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(
      ({ name, data: { frequencies, categories } }, idx) => {
        const y = transformFrequencies(frequencies);
        return {
          name,
          mode: 'lines+markers',
          x: categories,
          y: y,
          type: 'scatter',
          hovertemplate: getHoverTemplate(item),
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
      },
    };
  }, [data, item.column, plotlyLayoutProps, transformFrequencies]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationFrequencyDistributionRenderer(
  props: BaseVisualizationComponentProps<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
) {
  const { item } = props;
  if (
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.BarChart
  ) {
    return <VisualizationFrequencyDistributionBarChart {...props} />;
  }
  if (
    item.config.display ===
    VisualizationFrequencyDistributonDisplayMode.LinePlot
  ) {
    return <VisualizationFrequencyDistributionLinePlot {...props} />;
  }
  throw Error(
    `${item.config.display} is not a valid display mode for frequency distribution`,
  );
}
