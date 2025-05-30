import { LinearRegressionResultModel } from '@/api/statistical-analysis';
import {
  RegressionInterceptResultRenderer,
  useRegressionAlphaConstrainedColors,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  usePredictedResultsBaselineLine,
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
import {
  formatConfidenceInterval,
  formatConfidenceLevel,
  pValueToConfidenceLevel,
} from './utils';
import { PlotParams } from 'react-plotly.js';
import { zip } from 'lodash-es';

const LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.SampleSize,
  RegressionVisualizationTypeEnum.PredictionPerIndependentVariable,
  RegressionVisualizationTypeEnum.VarianceInflationFactor,
];
const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
];

interface UseLinearRegressionEveryPredictionResultPlotProps {
  data: LinearRegressionResultModel;
  config: LinearRegressionConfigType;
  type: RegressionVisualizationTypeEnum;
  alpha: number;
  baseline: number;
}

function useLinearRegressionPredictionResultPlot(
  props: UseLinearRegressionEveryPredictionResultPlotProps,
) {
  const { data, config, type, alpha, baseline } = props;
  const colors = useRegressionAlphaConstrainedColors({
    coefficients: data.coefficients,
    alpha,
  });
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (
      type !== RegressionVisualizationTypeEnum.PredictionPerIndependentVariable
    ) {
      return null;
    }

    return {
      data: [
        {
          x: data.independent_variables,
          y: data.predictions.map((prediction) => prediction.mean),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.statistic),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(coefficient.confidence_interval),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Mean</b>: %{y}',
            '<b>Coefficient</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]:.3f}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Means of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Predicted Mean`,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    type,
    data.independent_variables,
    data.predictions,
    data.coefficients,
    colors,
    config.target,
    baselineLayout,
  ]);
  return plot;
}

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
  const predictionPlot = useLinearRegressionPredictionResultPlot({
    data,
    type,
    alpha,
    config,
    baseline: data.baseline_prediction.mean,
  });
  const usedPlot =
    sampleSizePlot ??
    vifPlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    predictionPlot;
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
