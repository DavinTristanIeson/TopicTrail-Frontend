import {
  OrdinalRegressionCutpointModel,
  OrdinalRegressionResultModel,
} from '@/api/statistic-test';
import {
  COMMON_REGRESSION_VISUALIZATION_TYPES,
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
  RegressionVisualizationData,
  useRegressionVisualizationData,
} from './data';
import {
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

const ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
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

export default function OrdinalRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    OrdinalRegressionResultModel,
    RegressionConfigType
  >,
) {
  const { data: rawData } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = useRegressionVisualizationData({
    coefficients: rawData.coefficients,
    statisticName: 'Z-Statistic',
    supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
  });
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
      <PlotInlineConfiguration>
        {VisualizationSelect}
        {AlphaSlider}
      </PlotInlineConfiguration>
      <StatisticTestWarningsRenderer warnings={rawData.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood'}
          value={rawData.log_likelihood_ratio}
          info="Measures how well the model fits the data, or the likelihood of observing the data under the fitted model parameters. A higher log-likelihood indicates a better model fit (and it's commonly negative)."
        />
        <ResultCard
          label={'Sample Size'}
          value={rawData.sample_size}
          info="The number of rows used to fit the regression model."
        />
        {rawData.reference && (
          <ResultCard
            label={'Reference'}
            value={rawData.reference}
            info="The independent variable used as the reference variable."
          />
        )}
      </Group>
      <RegressionConvergenceResultRenderer converged={rawData.converged} />
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
