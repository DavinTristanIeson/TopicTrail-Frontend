import {
  LogisticRegressionPredictionResultModel,
  LogisticRegressionResultModel,
} from '@/api/statistical-analysis';

import { Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import {
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionParametersVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
  useRegressionVisualizationTypeSelect,
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionVariableInfoVisualizationType,
} from './types';
import { ResultCard } from '@/components/visual/result-card';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { PlotParams } from 'react-plotly.js';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { formatNumber } from '@/common/utils/number';
import { useVisualizationAlphaSlider } from '../plot-config';
import {
  getRegressionCoefficientsVisualizationData,
  getRegressionProbabilityMarginalEffectsVisualizationData,
  useAdaptMutationToRegressionPredictionAPIResult,
} from './data';
import {
  useRegressionCoefficientMultiSelect,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  RegressionConvergenceResultRenderer,
  RegressionInterceptResultRenderer,
  usePredictedResultsBaselineLine,
  useRegressionMarginalEffectsBarChartPlot,
  useMarginalEffectsConfidenceLevelRegressionResultPlot,
} from './plots';
import { RegressionCoefficientsTable } from './tables';

const LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = Object.values(
  RegressionParametersVisualizationTypeEnum,
);

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

  const {
    Component: CoefficientMultiSelect,
    coefficients,
    select: selectCoefficients,
  } = useRegressionCoefficientMultiSelect({
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

  const visdataMarginalEffects = React.useMemo(() => {
    return [
      {
        name: 'Marginal Effects',
        data: getRegressionProbabilityMarginalEffectsVisualizationData({
          marginalEffects: selectCoefficients(data.marginal_effects),
        }),
      },
    ];
  }, [data.marginal_effects, selectCoefficients]);

  const commonMarginalEffectsProps = {
    alpha,
    type,
    data: visdataMarginalEffects,
  };
  const marginalEffectsPlot = useRegressionMarginalEffectsBarChartPlot(
    commonMarginalEffectsProps,
  );
  const marginalEffectsConfidenceLevelsPlot =
    useMarginalEffectsConfidenceLevelRegressionResultPlot(
      commonMarginalEffectsProps,
    );

  const usedPlot =
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot ??
    marginalEffectsPlot ??
    marginalEffectsConfidenceLevelsPlot;

  const Header = (
    <>
      <RegressionConvergenceResultRenderer
        converged={data.fit_evaluation.converged}
      />
      {VisualizationSelect}
    </>
  );

  if (type === RegressionParametersVisualizationTypeEnum.Table) {
    return (
      <Stack>
        {Header}
        <RegressionCoefficientsTable
          coefficients={data.coefficients}
          intercept={data.intercept}
          marginalEffects={data.marginal_effects}
          modelType={RegressionModelType.Logistic}
        />
      </Stack>
    );
  }
  return (
    <Stack>
      {Header}
      {AlphaSlider}
      {CoefficientMultiSelect}
      {data.intercept && (
        <RegressionInterceptResultRenderer
          intercept={data.intercept}
          reference={data.reference}
          modelType={RegressionModelType.Logistic}
        />
      )}
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
    baseline: data.baseline_prediction.probability * 100,
    percentage: true,
  });

  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.independent_variables);
    return {
      data: [
        {
          x: data.predictions.map((prediction) => prediction.variable),
          y: data.predictions.map(
            (prediction) => prediction.prediction.probability * 100,
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
  const { data, config } = props;
  return (
    <BaseRegressionVariablesInfoSection
      independentVariables={data.independent_variables}
      dependentVariableLevels={data.levels}
      interpretation={config.interpretation}
      observationCount={data.sample_size}
      supportedTypes={Object.values(RegressionVariableInfoVisualizationType)}
    />
  );
}
