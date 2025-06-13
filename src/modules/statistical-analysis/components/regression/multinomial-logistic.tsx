import {
  MultinomialLogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/multinomial-regression';
import { Group, Stack } from '@mantine/core';
import {
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionParametersVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
  useRegressionVisualizationTypeSelect,
  RegressionVariableInfoVisualizationType,
} from './types';
import { useVisualizationAlphaSlider } from '../plot-config';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { MultinomialPredictionPlot } from './multinomial-predictions';
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
  MultinomialLogisticRegressionInterceptsRenderer,
  PredictedProbabilityDistributionPlot,
  useMarginalEffectsConfidenceLevelRegressionResultPlot,
  useRegressionMarginalEffectsBarChartPlot,
} from './plots';
import { RegressionCoefficientsPerFacetTable } from './tables';

const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES =
  Object.values(RegressionParametersVisualizationTypeEnum);

export function MultinomialLogisticRegressionCoefficientsPlot(
  props: BaseStatisticalAnalysisResultRendererProps<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { data } = props;

  // Constraints
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes:
        MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
      dictionary: REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
    });

  // Plots
  const { Component: CoefficientMultiSelect, select: selectCoefficients } =
    useRegressionCoefficientMultiSelect({
      coefficients: data.facets[0]!.coefficients,
    });
  const visdata = React.useMemo(() => {
    return data.facets.map((facet) => {
      return {
        name: facet.level,
        data: getRegressionCoefficientsVisualizationData({
          coefficients: selectCoefficients(facet.coefficients),
          modelType: RegressionModelType.MultinomialLogistic,
        }),
      };
    });
  }, [data.facets, selectCoefficients]);

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
    return data.marginal_effects.map((facet) => {
      return {
        name: facet.level,
        data: getRegressionProbabilityMarginalEffectsVisualizationData({
          marginalEffects: facet.marginal_effects,
        }),
      };
    });
  }, [data.marginal_effects]);

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
      <Group>
        {data.reference && (
          <ResultCard
            label={'Independent Variable Reference'}
            value={data.reference}
            info="The independent variable used as the reference variable."
            miw={512}
          />
        )}
        {data.reference_dependent && (
          <ResultCard
            label={'Dependent Variable Level Reference'}
            value={data.reference_dependent}
            info="The level of dependent variable used as the reference level."
            miw={512}
          />
        )}
      </Group>
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
        <RegressionCoefficientsPerFacetTable facets={data.facets} />
      </Stack>
    );
  }

  return (
    <Stack>
      {Header}
      {AlphaSlider}
      {CoefficientMultiSelect}
      <MultinomialLogisticRegressionInterceptsRenderer
        type={type}
        data={data}
      />
      <div>{usedPlot && <PlotRenderer plot={usedPlot} height={720} />}</div>
    </Stack>
  );
}

export function MultinomialLogisticRegressionPredictionResultRenderer(
  props: StatisticalAnalysisPredictionResultRendererProps<
    MultinomialLogisticRegressionPredictionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { result } = props;
  return (
    <PredictedProbabilityDistributionPlot
      dependentVariableLevels={result.levels}
      probabilities={result.probabilities}
    />
  );
}

export function DefaultMultinomialLogisticRegressionPredictionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { data, config } = props;
  return (
    <MultinomialPredictionPlot
      baselinePrediction={data.baseline_prediction}
      levels={data.levels}
      predictions={data.predictions}
      supportsCumulative={false}
      target={config.target}
    />
  );
}

export const useMultinomialLogisticRegressionPredictionAPIHook: RegressionPredictionAPIHookType<
  MultinomialLogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionConfigType
> = function (params) {
  const { input } = params;
  const mutationResult = client.useMutation(
    'post',
    '/statistical-analysis/{project_id}/regression/prediction/logistic/multinomial',
  );
  return useAdaptMutationToRegressionPredictionAPIResult<MultinomialLogisticRegressionPredictionResultModel>(
    input,
    mutationResult,
  );
};

export function MultinomialLogisticRegressionVariablesInfoSection(
  props: BaseStatisticalAnalysisResultRendererProps<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { data } = props;
  return (
    <BaseRegressionVariablesInfoSection
      independentVariables={data.independent_variables}
      dependentVariableLevels={data.levels}
      supportedTypes={Object.values(RegressionVariableInfoVisualizationType)}
    />
  );
}
