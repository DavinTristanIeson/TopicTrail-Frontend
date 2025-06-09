import {
  LinearRegressionPredictionResultModel,
  LinearRegressionResultModel,
} from '@/api/statistical-analysis';
import {
  RegressionInterceptResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  usePredictedResultsBaselineLine,
  useRegressionCoefficientMultiSelect,
} from './components';
import { Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { LinearRegressionConfigType } from '../../configuration/linear-regression';
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
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { without } from 'lodash-es';
import { PlotParams } from 'react-plotly.js';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { useVisualizationAlphaSlider } from '../plot-config';
import { RegressionCoefficientsTable } from './coefficients-table';

const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = without(
  Object.values(RegressionCoefficientsVisualizationTypeEnum),
  RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
);

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
      supportedTypes: LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
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
          coefficients: coefficients,
          modelType: RegressionModelType.Linear,
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

  const usedPlot = coefficientPlot ?? confidenceLevelPlot;

  if (type === RegressionCoefficientsVisualizationTypeEnum.Table) {
    return (
      <Stack>
        {VisualizationSelect}
        <RegressionCoefficientsTable
          coefficients={data.coefficients}
          intercept={data.intercept}
          modelType={RegressionModelType.Linear}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      {VisualizationSelect}
      {AlphaSlider}
      {CoefficientMultiSelect}
      {data.intercept && (
        <RegressionInterceptResultRenderer
          intercept={data.intercept}
          reference={data.reference}
          statisticName="T-Statistic"
        />
      )}
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
          x: data.predictions.map((prediction) => prediction.variable),
          y: data.predictions.map((prediction) => prediction.prediction.mean),
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
  }, [data.predictions, data.coefficients, config.target, baselineLayout]);
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
