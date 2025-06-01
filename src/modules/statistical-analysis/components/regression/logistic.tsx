import {
  LogisticRegressionPredictionResultModel,
  LogisticRegressionResultModel,
} from '@/api/statistical-analysis';
import {
  RegressionConvergenceResultRenderer,
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  usePredictedResultsBaselineLine,
} from './components';
import { useVisualizationAlphaSlider } from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionCoefficientsVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
  useRegressionVisualizationTypeSelect,
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionVariableInfoVisualizationType,
} from './types';
import {
  getRegressionCoefficientsVisualizationData,
  useAdaptMutationToRegressionPredictionAPIResult,
} from './data';
import { ResultCard } from '@/components/visual/result-card';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { StatisticTestWarningsRenderer } from '../statistic-test/common';
import React from 'react';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { without, zip } from 'lodash-es';
import { PlotParams } from 'react-plotly.js';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';

const LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionCoefficientsVisualizationTypeEnum.Coefficient,
  RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel,
  RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
];

export function LogisticRegressionCoefficientsPlot(
  props: BaseStatisticalAnalysisResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { data } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
      dictionary: REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
    });
  const visdata = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: data.coefficients,
      modelType: RegressionModelType.Logistic,
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
  const oddsRatioPlot = useOddsRatioRegressionResultPlot(commonProps);
  const usedPlot = coefficientPlot ?? confidenceLevelPlot ?? oddsRatioPlot;
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={data.warnings} />
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={data.fit_evaluation.log_likelihood_ratio}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={data.fit_evaluation.p_value}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={pValueToConfidenceLevel(data.fit_evaluation.p_value)}
          percentage
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={data.fit_evaluation.pseudo_r_squared}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
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
      <RegressionConvergenceResultRenderer
        converged={data.fit_evaluation.converged}
      />
      {VisualizationSelect}
      {AlphaSlider}
      {usedPlot && <PlotRenderer plot={usedPlot} height={720} />}
    </Stack>
  );
}

export function LogisticRegressionPredictionResultRenderer(
  props: StatisticalAnalysisPredictionResultRendererProps<
    LogisticRegressionPredictionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { result } = props;
  return (
    <ResultCard
      label="Predicted Probability"
      value={`${(result.probability * 100).toFixed(3)}%`}
    />
  );
}

export function DefaultLogisticRegressionPredictionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
  >,
) {
  const { data, config } = props;
  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.probability,
    percentage: true,
  });

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.independent_variables);
    return {
      data: [
        {
          x: data.independent_variables.map((variable) => variable.name),
          y: data.predictions.map((prediction) => prediction.probability * 100),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.odds_ratio),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(
                coefficient.odds_ratio_confidence_interval,
              ),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Probability</b>: %{y}',
            '='.repeat(30),
            '<b>Odds Ratio</b>: %{customdata[0]:.3f}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]:.3f}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Probabilities of ${config.target.name} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Predicted Probability`,
          ticksuffix: '%',
          minallowed: 0,
          maxallowed: 100,
        },
        ...baselineLayout,
      },
    } as PlotParams;
  }, [
    baselineLayout,
    config.target,
    data.coefficients,
    data.independent_variables,
    data.predictions,
  ]);
  return <PlotRenderer plot={plot} />;
}

export const useLogisticRegressionPredictionAPIHook: RegressionPredictionAPIHookType<
  LogisticRegressionPredictionResultModel,
  LogisticRegressionConfigType
> = function (params) {
  const { input } = params;
  const mutationResult = client.useMutation(
    'post',
    '/statistical-analysis/{project_id}/regression/prediction/logistic',
  );
  return useAdaptMutationToRegressionPredictionAPIResult<LogisticRegressionPredictionResultModel>(
    input,
    mutationResult,
  );
};

export function LogisticRegressionVariablesInfoSection(
  props: BaseStatisticalAnalysisResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
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
