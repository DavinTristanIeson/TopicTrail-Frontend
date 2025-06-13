import { getConfidenceIntervalOffsets } from '@/modules/visualization/components/utils';
import { NamedData } from '@/modules/visualization/types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { RegressionParametersVisualizationTypeEnum } from '../types';
import { useRegressionAlphaConstrainedColors } from './config';
import { RegressionMarginalEffectsVisualizationData } from '../data';
import { useCommonConfidenceLevelPlot } from './coefficients';

interface UseRegressionMarginalEffectsBarChartPlotProps {
  data: NamedData<RegressionMarginalEffectsVisualizationData>[];
  type: RegressionParametersVisualizationTypeEnum;
  alpha: number;
}

export function useRegressionMarginalEffectsBarChartPlot(
  props: UseRegressionMarginalEffectsBarChartPlotProps,
) {
  const { data, type, alpha } = props;
  const generateColors = useRegressionAlphaConstrainedColors({
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionParametersVisualizationTypeEnum.MarginalEffects) {
      return null;
    }
    const colorMap = generateColors(
      data.map(({ name, data }) => {
        return {
          name,
          data: data.marginalEffects,
        };
      }),
    );
    const traces = data.map(({ data, name }) => {
      const {
        confidenceIntervals,
        hovertemplate,
        customdata,
        variables: x,
        values: y,
      } = data;
      const error_y = getConfidenceIntervalOffsets(y, confidenceIntervals!);
      return {
        name,
        x,
        y,
        error_y,
        type: 'bar',
        marker: {
          color: colorMap[name],
        },
        customdata,
        hovertemplate,
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: {
        title: `Marginal Effects of Each Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
        },
        yaxis: {
          title: `Probability (%)`,
          minallowed: 0,
          maxallowed: 100,
          range: [0, 100],
          ticksuffix: '%',
        },
      },
    } as PlotParams;
  }, [data, generateColors, type]);
  return plot;
}

interface UseMarginalEffectsConfidenceLevelRegressionResultPlot {
  type: RegressionParametersVisualizationTypeEnum;
  alpha: number;
  data: NamedData<RegressionMarginalEffectsVisualizationData>[];
  layout?: PlotParams['layout'];
}

export function useMarginalEffectsConfidenceLevelRegressionResultPlot(
  props: UseMarginalEffectsConfidenceLevelRegressionResultPlot,
) {
  const { type, alpha, data, layout } = props;
  const plot = useCommonConfidenceLevelPlot({
    alpha,
    layout,
    data: React.useMemo(() => {
      return data.map((facet) => {
        return {
          name: facet.name,
          data: {
            variables: facet.data.variables,
            confidenceLevels: facet.data.confidenceLevels,
            customdata: facet.data.customdata,
            hovertemplate: facet.data.hovertemplate,
          },
        };
      });
    }, [data]),
  });
  if (
    type ===
    RegressionParametersVisualizationTypeEnum.MarginalEffectsConfidenceLevel
  ) {
    return plot;
  }
  return undefined;
}
