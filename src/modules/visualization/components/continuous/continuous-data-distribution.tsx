import { generateColorsFromSequence } from '@/common/utils/colors';
import { BaseVisualizationComponentProps } from '../../types/base';
import { PlotParams } from 'react-plotly.js';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationContinuousDataDistributionConfigType,
  VisualizationContinuousDataDistributionDisplayMode,
} from '../../configuration/continuous-data-distribution';
import { usePlotRendererHelperProps } from '../utils';

function VisualizationContinuousDataDistributionViolinBoxPlot(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(({ name, data }, idx) => {
      return {
        name,
        y: data,
        type:
          item.config.display ===
          VisualizationContinuousDataDistributionDisplayMode.ViolinPlot
            ? 'violin'
            : 'box',
        marker: {
          color: colors[idx],
        },
      };
    });
    return {
      data: subplots,
      layout: {
        title: `Continuous Data Distribution of ${item.column}`,
      },
    };
  }, [data, item.column, item.config.display]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationContinuousDataDistributionHistogram(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(({ name, data }, idx) => {
      return {
        name,
        x: data,
        type: 'histogram',
        marker: {
          color: colors[idx],
        },
      };
    });
    return {
      data: subplots,
      layout: {
        title: `Continuous Data Distribution of ${item.column}`,
        yaxis: {
          minallowed: 0,
        },
        barmode: 'group',
      },
    };
  }, [data]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationContinuousDataDistributionRenderer(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const mode = props.item.config.display;
  if (mode === VisualizationContinuousDataDistributionDisplayMode.Histogram) {
    return <VisualizationContinuousDataDistributionHistogram {...props} />;
  } else if (
    mode === VisualizationContinuousDataDistributionDisplayMode.BoxPlot ||
    mode === VisualizationContinuousDataDistributionDisplayMode.ViolinPlot
  ) {
    return <VisualizationContinuousDataDistributionViolinBoxPlot {...props} />;
  } else {
    throw Error(
      `${mode} is not a valid display mode for continuous data distribution.`,
    );
  }
}
