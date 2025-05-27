import { LinearRegressionResultModel } from '@/api/statistic-test';
import {
  COMMON_REGRESSION_VISUALIZATION_TYPES,
  RegressionInterceptResultRenderer,
  useCommonRegressionResultPlot,
  useEffectOnInterceptRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import {
  PlotInlineConfiguration,
  useVisualizationAlphaSlider,
} from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { LinearRegressionConfigType } from '../../configuration/regression';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { useRegressionVisualizationData } from './data';
import {
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { StatisticTestWarningsRenderer } from '../common';

const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
];

export default function LinearRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { data: rawData, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = useRegressionVisualizationData({
    coefficients: rawData.coefficients,
    supportedTypes: LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    statisticName: 'T-Statistic',
  });
  const commonPlot = useCommonRegressionResultPlot({
    alpha,
    type,
    data,
  });
  const effectOnInterceptPlot = useEffectOnInterceptRegressionResultPlot({
    data,
    type,
    intercept: rawData.intercept!,
    targetName: config.target,
    variant: 'linear',
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
          label={'F-Statistic'}
          value={rawData.f_statistic}
          info="A statistic obtained from testing whether the independent variables can explain the variance of the dependent variable. To interpret this, you should rely on p-value and R-squared instead."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.p_value.toFixed(3)}
          info={`The probability that the F-statistic would be as extreme as it is under the assumption that the independent variables do not affect the dependent variables. You should use the Confidence Level to interpret how confident we are that the independent variables DO affect the dependent variables.`}
        />
        <ResultCard
          label={'Confidence Level'}
          value={`${(100 * (1 - rawData.p_value)).toFixed(3)}%`}
        />
        <ResultCard
          label={'Adjusted R-Squared'}
          value={rawData.r_squared.toFixed(3)}
          info="The proportion of the variance in the dependent variable that is predictable from the independent variables. It ranges from 0 (0%) to 1 (100%)."
        />
        <ResultCard
          label={'RMSE'}
          value={rawData.rmse.toFixed(3)}
          info="The average magnitude of the errors between predicted and actual values."
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
      {rawData.intercept && (
        <RegressionInterceptResultRenderer
          intercept={rawData.intercept}
          reference={rawData.reference}
          statisticName="T-Statistic"
        />
      )}
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
