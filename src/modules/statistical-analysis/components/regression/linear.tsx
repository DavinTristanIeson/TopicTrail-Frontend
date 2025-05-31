import { LinearRegressionResultModel } from '@/api/statistical-analysis';
import {
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { LinearRegressionConfigType } from '../../configuration/regression';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { getRegressionCoefficientsVisualizationData } from './data';
import {
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import React from 'react';
import { formatConfidenceLevel } from './utils';

const LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.VarianceInflationFactor,
];
const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
];

export default function LinearRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { data: data, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({
    enabled: config.standardized,
  });
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: config.standardized
        ? LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES
        : LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES,
    });
  const visdata = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: data.coefficients,
      modelType: RegressionModelType.Linear,
    });
  }, [data.coefficients]);

  const commonProps = {
    alpha,
    type,
    data: visdata,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);

  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    coefficients: data.coefficients,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    coefficients: data.coefficients,
    type,
  });
  const usedPlot =
    sampleSizePlot ?? vifPlot ?? coefficientPlot ?? confidenceLevelPlot;
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={data.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'F-Statistic'}
          value={data.fit_evaluation.f_statistic?.toFixed(3)}
          info="A statistic obtained from testing whether the independent variables can explain the variance of the dependent variable. To interpret this, you should rely on p-value and R-squared instead."
        />
        <ResultCard
          label={'P-Value'}
          value={data.fit_evaluation.p_value?.toFixed(3)}
          info={`The probability that the F-statistic would be as extreme as it is under the assumption that the independent variables do not affect the dependent variables. You should use the Confidence Level to interpret how confident we are that the independent variables DO affect the dependent variables.`}
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(data.fit_evaluation.p_value)}
        />
        <ResultCard
          label={'Adjusted R-Squared'}
          value={data.fit_evaluation.r_squared?.toFixed(3)}
          info="The proportion of the variance in the dependent variable that is predictable from the independent variables. It ranges from 0 (0%) to 1 (100%)."
        />
        <ResultCard
          label={'RMSE'}
          value={data.fit_evaluation.rmse?.toFixed(3)}
          info="The average magnitude of the errors between predicted and actual values."
        />
        <ResultCard
          label={'Sample Size'}
          value={data.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      {data.intercept && (
        <RegressionInterceptResultRenderer
          intercept={data.intercept}
          reference={data.reference}
          statisticName="T-Statistic"
        />
      )}
      {VisualizationSelect}
      {AlphaSlider}
      {usedPlot && <PlotRenderer plot={usedPlot} height={720} />}
    </Stack>
  );
}
