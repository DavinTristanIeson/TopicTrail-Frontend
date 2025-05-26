import { LogisticRegressionCoefficientModel } from '@/api/statistic-test';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { useMantineTheme } from '@mantine/core';
import { zip } from 'lodash-es';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  UltimateRegressionCoefficientModel,
  RegressionVisualizationTypeEnum,
  REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
} from './types';
import { RegressionVisualizationData } from './data';

interface useCommonRegressionResultPlot {
  type: RegressionVisualizationTypeEnum;
  alpha: number;
  data: RegressionVisualizationData;
}

export const COMMON_REGRESSION_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.Confidence,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.Statistic,
  RegressionVisualizationTypeEnum.StdErr,
];
export function useCommonRegressionResultPlot(
  props: useCommonRegressionResultPlot,
) {
  const { data, type, alpha } = props;
  const mantineColors = useMantineTheme().colors;
  const plot = React.useMemo<PlotParams | null>(() => {
    const configEntry = REGRESSION_VISUALIZATION_TYPE_DICTIONARY[type];
    if (configEntry == null) {
      throw new Error(`${type} is not a valid regression visualization type.`);
    }
    if (!COMMON_REGRESSION_VISUALIZATION_TYPES.includes(type)) {
      return null;
    }

    const {
      customdata,
      hovertemplate,
      coefficients,
      pValues,
      variables: x,
      xaxisTitle,
      statisticName,
      confidenceLevels,
    } = data;
    const y = coefficients.map((coefficient) =>
      configEntry.select(coefficient),
    );
    const { colors: generatedColors } = generateColorsFromSequence(x);
    const colors = zip(generatedColors, pValues).map(([color, pValue]) => {
      if (pValue! < alpha) {
        return color!;
      }
      return mantineColors.gray[6];
    });

    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          marker: {
            color: colors,
          },
          error_y:
            type === RegressionVisualizationTypeEnum.Statistic
              ? {
                  type: 'data',
                  array: confidenceLevels,
                  visible: true,
                }
              : undefined,
          customdata: customdata as any,
          hovertemplate,
        },
      ],
      layout: {
        title: configEntry.label,
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title:
            type === RegressionVisualizationTypeEnum.Statistic
              ? statisticName
              : configEntry.label,
        },
      },
    };
  }, [alpha, data, mantineColors.gray, type]);
  return plot;
}

interface UseRegressionStatisticPlotProps {
  data: RegressionVisualizationData;
  type: RegressionVisualizationTypeEnum;
}

export function useSampleSizeRegressionResultPlot(
  props: UseRegressionStatisticPlotProps,
) {
  const { data, type } = props;
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.SampleSize) {
      return null;
    }
    const { hovertemplate, customdata, sampleSizes, variables: x } = data;
    return {
      data: [
        {
          x,
          y: sampleSizes,
          type: 'bar',
          customdata,
          hovertemplate,
        },
      ],
      layout: {
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: 'Sample Size',
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [data, type]);
  return plot;
}

interface UseVarianceInflationFactorRegressionResultPlotProps {
  type: RegressionVisualizationTypeEnum;
  data: RegressionVisualizationData;
}

export function useVarianceInflationFactorRegressionResultPlot(
  props: UseVarianceInflationFactorRegressionResultPlotProps,
) {
  const { type, data } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.VarianceInflationFactor) {
      return null;
    }
    const { varianceInflationFactors, variables, hovertemplate, customdata } =
      data;
    const VIFlineAnnotations: PlotParams['layout']['annotations'] = [
      {
        x: 0,
        xref: 'x',
        y: 5,
        yref: 'y',
        text: 'Strong Multicollinearity',
      },
    ];
    const VIFlineShapes: PlotParams['layout']['shapes'] = [
      {
        type: 'line',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: 5,
        y1: 5,
        line: {
          color: mantineColors.yellow[6],
          width: 3,
          dash: 'dash',
        },
      },
    ];
    return {
      data: [
        {
          x: variables,
          y: varianceInflationFactors,
          type: 'bar',
          hovertemplate,
          customdata,
          marker: {
            color: generateColorsFromSequence(variables).colors,
          },
        },
      ],
      layout: {
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: 'Variance Inflation Factory',
          minallowed: 0,
          range: [0, 6],
        },
        annotations: VIFlineAnnotations,
        shapes: VIFlineShapes,
      },
    } as PlotParams;
  }, [data, mantineColors.yellow, type]);
}

interface UseInterceptEffectsPlotProps {
  intercept: UltimateRegressionCoefficientModel;
  data: RegressionVisualizationData;
  type: RegressionVisualizationTypeEnum;
  targetName: string;
  variant: 'linear' | 'logistic';
}

export function useEffectOnInterceptRegressionResultPlot(
  props: UseInterceptEffectsPlotProps,
) {
  const { intercept, data, type, variant, targetName } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.EffectOnIntercept) {
      return null;
    }
    const {
      variables,
      oddsRatios: oddsRatios,
      values,
      xaxisTitle,
      customdata,
      hovertemplate,
    } = data;
    let y: number[];
    const useOdds = variant === 'logistic';
    const interceptOdds = (intercept as LogisticRegressionCoefficientModel)
      .odds_ratio;
    if (useOdds) {
      if (oddsRatios == null || interceptOdds == null) {
        throw new Error(
          'Odds ratios are not provided. This may be a developer oversight',
        );
      }
      // odds ratio relationship is multiplicative. Technically, the coefficient still has an additive relationship to the intercept, but the coefficient uses log-odds (where multiplication = addition) so it's multiplicative when we transform them into odds ratio.
      y = oddsRatios.map((odds_ratio) => interceptOdds * odds_ratio);
    } else {
      y = values.map((value) => intercept.value + value);
    }
    const interceptValue = useOdds ? interceptOdds : intercept.value;
    return {
      data: [
        {
          name: 'Intercept',
          x: ['Intercept'],
          y: [interceptValue],
          marker: {
            color: mantineColors.brand[6],
          },
          showlegend: false,
        },
        {
          name: 'Coefficients',
          showlegend: false,
          x: variables,
          y,
          base: interceptValue,
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(variables).colors,
          },
          customdata,
          hovertemplate,
        },
      ],
      layout: {
        title: 'Effect on Intercept',
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title:
            variant == 'linear'
              ? `Mean of ${targetName}`
              : variant == 'logistic'
                ? `Odds of Predicting ${targetName}`
                : undefined,
        },
        shapes: [
          {
            type: 'line',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            x1: 1,
            y0: interceptValue,
            y1: interceptValue,
            line: {
              color: mantineColors.brand[6],
              width: 3,
              dash: 'dash',
            },
          },
        ],
      },
    } as PlotParams;
  }, [data, intercept, mantineColors.brand, targetName, type, variant]);
}
