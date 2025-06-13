import { generateColorsFromSequence } from '@/common/utils/colors';
import { formatNumber } from '@/common/utils/number';
import { NamedData } from '@/modules/visualization/types/base';
import { useMantineTheme } from '@mantine/core';
import { merge } from 'lodash-es';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { RegressionParametersVisualizationTypeEnum } from '../types';
import { pValueToConfidenceLevel } from '../utils';
import { useRegressionAlphaConstrainedColors } from './config';
import { getConfidenceIntervalOffsets } from '@/modules/visualization/components/utils';
import { RegressionVisualizationData } from '../data';

interface UseCommonConfidenceLevelPlotProps {
  data: NamedData<{
    variables: string[];
    confidenceLevels: number[];
    customdata: any;
    hovertemplate: string;
  }>[];
  alpha: number;
  layout?: PlotParams['layout'];
}

export function useCommonConfidenceLevelPlot(
  props: UseCommonConfidenceLevelPlotProps,
) {
  const { data, alpha, layout } = props;
  const { colors: mantineColors } = useMantineTheme();
  const plot = React.useMemo<PlotParams | null>(() => {
    const { colorMap } = generateColorsFromSequence(
      data.map((facet) => facet.name),
    );
    const traces = data.map((data, idx, arr) => {
      const {
        name,
        data: { variables: x, confidenceLevels: y, customdata, hovertemplate },
      } = data;
      let color: string[] | string;
      if (arr.length === 1){
        color = generateColorsFromSequence(x).colors;
      } else {
        color = colorMap.get(name)!;
      }
      return {
        name,
        x,
        y,
        type: 'bar',
        marker: {
          color,
        },
        customdata,
        hovertemplate,
      } as PlotParams['data'][number];
    });

    const confidence = pValueToConfidenceLevel(alpha);

    return {
      data: traces,
      layout: merge(
        {
          title: 'Confidence Level of Each Coefficient',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
          },
          yaxis: {
            title: 'Confidence Level (%)',
            minallowed: 0,
            maxallowed: 100,
          },
          annotations: [
            {
              x: 0.1,
              xref: 'paper',
              y: confidence,
              yref: 'y',
              text: `Alpha: ${formatNumber(alpha)}<br>Confidence Level: ${formatNumber(confidence)}%`,
            },
          ],
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              yref: 'y',
              x0: 0,
              x1: 1,
              y0: confidence,
              y1: confidence,
              line: {
                color: mantineColors.brand[6],
                width: 3,
                dash: 'dash',
              },
            },
          ],
        },
        layout,
      ),
    } as PlotParams;
  }, [alpha, data, layout, mantineColors.brand]);
  return plot;
}

interface CommonRegressionResultPlotProps {
  type: RegressionParametersVisualizationTypeEnum;
  alpha: number;
  data: NamedData<RegressionVisualizationData>[];
  layout?: PlotParams['layout'];
}

export function useConfidenceLevelRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
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
  if (type === RegressionParametersVisualizationTypeEnum.ConfidenceLevel) {
    return plot;
  }
  return undefined;
}

export function useOddsRatioRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const generateColors = useRegressionAlphaConstrainedColors({
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionParametersVisualizationTypeEnum.OddsRatio) {
      return null;
    }
    const colorMap = generateColors(
      data.map((x) => {
        return {
          name: x.name,
          data: x.data.coefficients,
        };
      }),
    );
    const traces = data.map((data) => {
      const {
        name,
        data: {
          variables: x,
          oddsRatioConfidenceIntervals,
          oddsRatios,
          customdata,
          hovertemplate,
        },
      } = data;

      const y = oddsRatios!.map((ratio) => ratio - 1);
      const error_y = getConfidenceIntervalOffsets(
        oddsRatios!,
        oddsRatioConfidenceIntervals!,
      );
      return {
        name,
        x,
        y,
        type: 'bar',
        base: 1,
        customdata,
        hovertemplate,
        error_y,
        marker: {
          color: colorMap[name],
        },
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: merge(
        {
          title: 'Odds Ratio of Each Coefficient',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
          },
          yaxis: {
            title: 'Odds Ratio (Log-Scaled)',
            type: 'log',
            minallowed: -1,
          },
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              yref: 'y',
              x0: 0,
              x1: 1,
              y0: 1,
              y1: 1,
              line: {
                color: 'black',
                width: 2,
              },
            },
          ],
        },
        layout,
      ),
    } as PlotParams;
  }, [data, generateColors, layout, type]);
  return plot;
}

export function useCoefficientRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const generateColors = useRegressionAlphaConstrainedColors({
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionParametersVisualizationTypeEnum.Coefficient) {
      return null;
    }
    const colorMap = generateColors(
      data.map((x) => {
        return {
          name: x.name,
          data: x.data.coefficients,
        };
      }),
    );
    const traces = data.map((data) => {
      const {
        name,
        data: {
          variables: x,
          values: y,
          confidenceIntervals,
          customdata,
          hovertemplate,
        },
      } = data;

      const error_y = getConfidenceIntervalOffsets(y, confidenceIntervals!);
      return {
        name,
        x,
        y,
        type: 'bar',
        customdata,
        hovertemplate,
        error_y,
        marker: {
          color: colorMap[name],
        },
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: merge(
        {
          title: 'Coefficients',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
          },
          yaxis: {
            title: 'Coefficient Value',
          },
        },
        layout,
      ),
    } as PlotParams;
  }, [data, generateColors, layout, type]);
  return plot;
}
