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
  useRegressionCoefficientMultiSelect,
} from './components';
import { Stack } from '@mantine/core';
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
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { without } from 'lodash-es';
import { PlotParams } from 'react-plotly.js';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { formatNumber } from '@/common/utils/number';
import { useVisualizationAlphaSlider } from '../plot-config';
import { RegressionCoefficientsTable } from './coefficients-table';

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

  const { Component: CoefficientMultiSelect, coefficients } =
    useRegressionCoefficientMultiSelect({
      coefficients: data.coefficients,
    });
  const visdata = React.useMemo(() => {
    return [
      {
        name: 'Coefficients',
        data: getRegressionCoefficientsVisualizationData({
          coefficients,
          modelType: RegressionModelType.Logistic,
        }),
      },
    ];
  }, [coefficients]);

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

  if (type === RegressionCoefficientsVisualizationTypeEnum.Table) {
    return (
      <Stack>
        <RegressionConvergenceResultRenderer
          converged={data.fit_evaluation.converged}
        />
        {VisualizationSelect}
        <RegressionCoefficientsTable
          coefficients={data.coefficients}
          intercept={data.intercept}
          modelType={RegressionModelType.Logistic}
        />
      </Stack>
    );
  }
  return (
    <Stack>
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
      {CoefficientMultiSelect}
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
      value={`${formatNumber(result.probability * 100)}%`}
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
          x: data.predictions.map((prediction) => prediction.variable),
          y: data.predictions.map(
            (prediction) => prediction.prediction.probability,
          ),
          type: 'bar',
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Probability</b>: %{y}',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Probabilities of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
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
