import {
  OrdinalRegressionCutpointModel,
  OrdinalRegressionResultModel,
} from '@/api/statistic-test';
import {
  RegressionConvergenceResultRenderer,
  useCommonRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import {
  PlotInlineConfiguration,
  useVisualizationAlphaSlider,
} from '@/modules/visualization/components/configuration';
import { Group, Stack, useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  getRegressionCoefficientsVisualizationData,
  RegressionVisualizationData,
} from './data';
import {
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { PlotParams } from 'react-plotly.js';
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { RegressionConfigType } from '../../configuration/regression-common';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { ResultCard } from '@/components/visual/result-card';
import { StatisticTestWarningsRenderer } from '../common';
import { formatConfidenceInterval } from './utils';
import { unzip, zip } from 'lodash-es';

const ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
];

interface UseOrdinalEffectsOnCutpointsPlotProps {
  cutpoints: OrdinalRegressionCutpointModel[];
  data: RegressionVisualizationData;
  type: RegressionVisualizationTypeEnum;
}

export function useOrdinalEffectsOnCutpointsPlot(
  props: UseOrdinalEffectsOnCutpointsPlotProps,
) {
  const { cutpoints, data, type } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.EffectOnIntercept) {
      return null;
    }
    const { variables, oddsRatios, xaxisTitle, customdata, hovertemplate } =
      data;
    const y = oddsRatios;
    return {
      data: [
        {
          name: 'Cutpoints',
          x: Array.from({ length: cutpoints.length }, () => 'Cutpoints'),
          y: cutpoints.map((cutpoint) => cutpoint.value),
          customdata: cutpoints.map((cutpoint) => cutpoint.std_err),
          hovertemplate: [
            '<b>Cutpoint</b>: %{x}',
            '<b>Cumulative Odds</b>: %{y}',
            '<b>Standard Error</b>: %{customdata}',
          ],
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
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(variables).colors,
          },
          customdata,
          hovertemplate,
        },
      ],
      layout: {
        title: 'Effect Compared to Cutpoints',
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: `Odds of Having a Higher Rank`,
        },
        shapes: cutpoints.map((cutpoint) => {
          return {
            type: 'line',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            x1: 1,
            y0: cutpoint.value,
            y1: cutpoint.value,
            line: {
              color: mantineColors.brand[6],
              width: 3,
              dash: 'dash',
            },
          };
        }) as PlotParams['layout']['shapes'],
      },
    } as PlotParams;
  }, [cutpoints, data, mantineColors.brand, type]);
}

interface OrdinalRegressionCutpointsRendererProps {
  cutpoints: OrdinalRegressionCutpointModel[];
}

function OrdinalRegressionCutpointsRenderer(
  props: OrdinalRegressionCutpointsRendererProps,
) {
  const { cutpoints } = props;
  const plot = React.useMemo(() => {
    const baseCutpoint = cutpoints[0]!;
    const base = baseCutpoint.confidence_interval[0] - 1;
    const cutpointNames = cutpoints.map((cutpoint) => cutpoint.name);
    const cutpointValues = cutpoints.map((cutpoint) => cutpoint.value);
    const confidenceIntervals = cutpoints.map(
      (cutpoint) => cutpoint.confidence_interval,
    );
    const confidenceIntervalStrings = confidenceIntervals.map(
      formatConfidenceInterval,
    );
    const sampleSizes = cutpoints.map((cutpoint) => cutpoint.sample_size);

    const customdata = zip(
      cutpointNames,
      cutpointValues,
      confidenceIntervalStrings,
      sampleSizes,
    );
    const hovertemplate = [
      'Level: %{customdata[0]}',
      'Cutpoint: %{customdata[1]}',
      'Confidence Interval: %{customdata[2]} (Alpha = 0.05)',
      'Sample Size: %{customdata[3]}',
    ].join('<br>');
    const { colors } = generateColorsFromSequence(cutpointNames);
    const [confidenceIntervalMinus, confidenceIntervalPlus] = unzip(
      zip(cutpointValues, confidenceIntervals).map(([cutpoint, interval]) => [
        // value - lower
        cutpoint! - interval![0],
        // upper - value
        interval![1] - cutpoint!,
      ]),
    );
    const x = cutpointValues.map((value) => value - base);
    return {
      data: [
        {
          x: x,
          y: cutpointNames,
          type: 'bar',
          orientation: 'h',
          base: base,
          marker: {
            color: colors,
          },
          error_x: {
            type: 'data',
            symmetric: false,
            array: confidenceIntervalMinus,
            arrayminus: confidenceIntervalPlus,
            visible: true,
          },
          customdata,
          hovertemplate,
        } as PlotParams['data'][number],
      ],
      layout: {
        title: 'Cutpoints of the Dependent Variable Levels',
        xaxis: {
          minallowed: base,
          title: 'Cutpoints',
        },
        yaxis: {
          title: 'Levels',
          autorange: 'reversed',
        },
        barmode: 'stack',
      },
    } as PlotParams;
  }, [cutpoints]);
  return <PlotRenderer plot={plot} />;
}

export default function OrdinalRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    OrdinalRegressionResultModel,
    RegressionConfigType
  >,
) {
  const { data: rawData } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: rawData.coefficients,
      modelType: RegressionModelType.Ordinal,
    });
  }, [rawData.coefficients]);
  const commonPlot = useCommonRegressionResultPlot({
    alpha,
    type,
    data,
  });
  const effectOnInterceptPlot = useOrdinalEffectsOnCutpointsPlot({
    data,
    type,
    cutpoints: rawData.cutpoints,
  });
  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    data,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    data,
    type,
  });
  const usedPlot =
    sampleSizePlot ?? vifPlot ?? effectOnInterceptPlot ?? commonPlot;

  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={rawData.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={rawData.log_likelihood_ratio.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.p_value.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={`${(100 * (1 - rawData.p_value)).toFixed(3)}%`}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={rawData.pseudo_r_squared.toFixed(3)}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
        />
        <ResultCard
          label={'Sample Size'}
          value={rawData.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      {rawData.reference && (
        <ResultCard
          label={'Reference'}
          value={rawData.reference}
          info="The independent variable used as the reference variable."
        />
      )}
      <RegressionConvergenceResultRenderer converged={rawData.converged} />
      <OrdinalRegressionCutpointsRenderer cutpoints={rawData.cutpoints} />
      <PlotInlineConfiguration>
        {VisualizationSelect}
        {AlphaSlider}
      </PlotInlineConfiguration>
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
