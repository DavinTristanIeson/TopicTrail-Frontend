import { generateColorsFromSequence } from '@/common/utils/colors';
import { BaseVisualizationComponentProps } from '../../types/base';
import { PlotParams } from 'react-plotly.js';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';

type DistributionDifferencesVisualizationProps =
  BaseVisualizationComponentProps<number[], object>;
interface DistributionDifferencesBasePlotProps
  extends DistributionDifferencesVisualizationProps {
  plotType: 'violin' | 'box';
}

function DistributionDifferencesBasePlot(
  props: DistributionDifferencesBasePlotProps,
) {
  const { data, plotType } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(({ name, data }, idx) => {
      return {
        name,
        y: data,
        type: plotType,
        marker: {
          color: colors[idx],
        },
      };
    });
    return {
      data: subplots,
      layout: {},
    };
  }, [data, plotType]);
  return <PlotRenderer plot={plot} />;
}

export function DistributionDifferencesBoxPlot(
  props: DistributionDifferencesVisualizationProps,
) {
  return <DistributionDifferencesBasePlot {...props} plotType="box" />;
}

export function DistributionDifferencesViolinPlot(
  props: DistributionDifferencesVisualizationProps,
) {
  return <DistributionDifferencesBasePlot {...props} plotType="violin" />;
}

export function DistributionDifferencesHistogram(
  props: DistributionDifferencesVisualizationProps,
) {
  const { data } = props;
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
        barmode: 'group',
      },
    };
  }, [data]);
  return <PlotRenderer plot={plot} />;
}
