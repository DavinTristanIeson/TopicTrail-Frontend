import {
  LinearRegressionPredictionResultModel,
  LinearRegressionResultModel,
} from '@/api/statistical-analysis';
import {
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  usePredictedResultsBaselineLine,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { LinearRegressionConfigType } from '../../configuration/regression';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import {
  getRegressionCoefficientsVisualizationData,
  useAdaptMutationToRegressionPredictionAPIResult,
} from './data';
import {
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionCoefficientsVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
  useRegressionVisualizationTypeSelect,
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionVariableInfoVisualizationType,
} from './types';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import React from 'react';
import { pValueToConfidenceLevel } from './utils';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { without } from 'lodash-es';
import { PlotParams } from 'react-plotly.js';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';

const LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionCoefficientsVisualizationTypeEnum.Coefficient,
];
const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...LINEAR_REGRESSION_NON_STANDARDIZED_SUPPORTED_VISUALIZATION_TYPES,
  RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel,
];

export function LinearRegressionCoefficientsPlot(
  props: BaseStatisticalAnalysisResultRendererProps<
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
      dictionary: REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
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

  const usedPlot = coefficientPlot ?? confidenceLevelPlot;
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={data.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'F-Statistic'}
          value={data.fit_evaluation.f_statistic}
          info="A statistic obtained from testing whether the independent variables can explain the variance of the dependent variable. To interpret this, you should rely on p-value and R-squared instead."
        />
        <ResultCard
          label={'P-Value'}
          value={data.fit_evaluation.p_value}
          info={`The probability that the F-statistic would be as extreme as it is under the assumption that the independent variables do not affect the dependent variables. You should use the Confidence Level to interpret how confident we are that the independent variables DO affect the dependent variables.`}
        />
        <ResultCard
          label={'Confidence Level'}
          value={pValueToConfidenceLevel(data.fit_evaluation.p_value)}
          percentage
        />
        <ResultCard
          label={'Adjusted R-Squared'}
          value={data.fit_evaluation.r_squared}
          info="The proportion of the variance in the dependent variable that is predictable from the independent variables. It ranges from 0 (0%) to 1 (100%)."
        />
        <ResultCard
          label={'RMSE'}
          value={data.fit_evaluation.rmse}
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

export function LinearRegressionPredictionResultRenderer(
  props: StatisticalAnalysisPredictionResultRendererProps<
    LinearRegressionPredictionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { result } = props;
  return <ResultCard label="Predicted Mean" value={result.mean} />;
}

export function DefaultLinearRegressionPredictionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { data, config } = props;
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.mean,
  });
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.coefficients.map((coefficient) => coefficient.name),
    );

    return {
      data: [
        {
          x: data.independent_variables.map((variable) => variable.name),
          y: data.predictions.map((prediction) => prediction.mean),
          type: 'bar',
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Mean</b>: %{y:.3f}',
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
          type: 'category',
        },
        yaxis: {
          title: `Predicted Mean`,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.predictions,
    data.coefficients,
    config.target,
    baselineLayout,
  ]);
  return <PlotRenderer plot={plot} />;
}

export const useLinearRegressionPredictionAPIHook: RegressionPredictionAPIHookType<
  LinearRegressionPredictionResultModel,
  LinearRegressionConfigType
> = function (params) {
  const { input } = params;
  const mutationResult = client.useMutation(
    'post',
    '/statistical-analysis/{project_id}/regression/prediction/linear',
  );
  return useAdaptMutationToRegressionPredictionAPIResult<LinearRegressionPredictionResultModel>(
    input,
    mutationResult,
  );
};

export function LinearRegressionVariablesInfoSection(
  props: BaseStatisticalAnalysisResultRendererProps<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { data } = props;
  return (
    <BaseRegressionVariablesInfoSection
      independentVariables={data.independent_variables}
      dependentVariableLevels={undefined}
      supportedTypes={without(
        Object.values(RegressionVariableInfoVisualizationType),
        RegressionVariableInfoVisualizationType.LevelSampleSize,
      )}
    />
  );
}
