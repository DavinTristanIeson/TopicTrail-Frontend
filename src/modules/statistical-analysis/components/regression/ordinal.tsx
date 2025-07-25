import {
  OrdinalRegressionPredictionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { Divider, Select, Stack, Switch } from '@mantine/core';
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
import { PlotParams } from 'react-plotly.js';
import React from 'react';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { RegressionConfigType } from '../../configuration/regression-common';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { ResultCard } from '@/components/visual/result-card';
import { zip } from 'lodash-es';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { useDisclosure } from '@mantine/hooks';
import { MultinomialPredictionPlot } from './plots/multinomial-predictions';
import { useVisualizationAlphaSlider } from '../plot-config';
import { OrdinalRegressionConfigType } from '../../configuration/multinomial-regression';
import {
  getRegressionCoefficientsVisualizationData,
  useAdaptMutationToRegressionPredictionAPIResult,
} from './data';
import {
  useRegressionCoefficientMultiSelect,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
  RegressionConvergenceResultRenderer,
  PredictedProbabilityDistributionPlot,
  usePredictedResultsBaselineLine,
  OrdinalRegressionThresholdsRenderer,
} from './plots';
import { RegressionCoefficientsTable } from './tables';
import { RegressionThresholdsTable } from './tables/thresholds';

const ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionParametersVisualizationTypeEnum.Coefficient,
  RegressionParametersVisualizationTypeEnum.ConfidenceLevel,
  RegressionParametersVisualizationTypeEnum.OddsRatio,
  RegressionParametersVisualizationTypeEnum.Table,
];

export function OrdinalRegressionCoefficientsPlot(
  props: BaseStatisticalAnalysisResultRendererProps<
    OrdinalRegressionResultModel,
    OrdinalRegressionConfigType
  >,
) {
  const { data, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: ORDINAL_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
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
          modelType: RegressionModelType.Ordinal,
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
  const oddsRatioPlot = useOddsRatioRegressionResultPlot({
    ...commonProps,
    layout: {
      yaxis: {
        title: 'Odds Ratio in Lower/Equal Rank (Log-Scaled)',
      },
    } as PlotParams['layout'],
  });
  const usedPlot = coefficientPlot ?? confidenceLevelPlot ?? oddsRatioPlot;

  const Header = (
    <>
      {data.reference && (
        <ResultCard
          label={'Reference'}
          value={data.reference}
          info="The independent variable used as the reference variable."
        />
      )}
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
        <RegressionThresholdsTable
          thresholds={data.thresholds}
          config={config}
        />
        <Divider />
        <RegressionCoefficientsTable
          coefficients={data.coefficients}
          intercept={null}
          modelType={RegressionModelType.Ordinal}
        />
      </Stack>
    );
  }

  return (
    <Stack>
      {Header}
      {AlphaSlider}
      {CoefficientMultiSelect}
      <OrdinalRegressionThresholdsRenderer thresholds={data.thresholds} />
      <div>{usedPlot && <PlotRenderer plot={usedPlot} height={720} />}</div>
    </Stack>
  );
}

export function OrdinalRegressionPredictionResultRenderer(
  props: StatisticalAnalysisPredictionResultRendererProps<
    OrdinalRegressionPredictionResultModel,
    OrdinalRegressionConfigType
  >,
) {
  const { result } = props;
  const [showCumulative, { toggle: toggleCumulative }] = useDisclosure(false);
  return (
    <Stack>
      <Switch
        checked={showCumulative}
        onChange={toggleCumulative}
        label="Show cumulative probability distribution?"
      />
      <ResultCard
        label="Latent Variable Value"
        value={result.latent_score}
        info="Ordinal regression works under the assumption that there is a latent score that defines the thresholds of the levels. This score represents the log-odds that a variable has a rank equal to or lower than the rank the latent variable value is associated with."
      />
      <PredictedProbabilityDistributionPlot
        dependentVariableLevels={result.levels}
        probabilities={
          showCumulative
            ? result.cumulative_probabilities
            : result.probabilities
        }
        title={
          showCumulative
            ? 'Predicted Cumulative Probability Distribution'
            : undefined
        }
      />
    </Stack>
  );
}

enum OrdinalRegressionPredictionDisplay {
  LatentScore = 'latent-score',
  ProbabilityDistribution = 'probability-distribution',
}
const ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY = {
  [OrdinalRegressionPredictionDisplay.ProbabilityDistribution]: {
    label: 'Probability Distribution',
    value: OrdinalRegressionPredictionDisplay.ProbabilityDistribution,
    description:
      'Show the probabilities or the cumulative probabiltiies of each level.',
  },
  [OrdinalRegressionPredictionDisplay.LatentScore]: {
    label: 'Latent Score',
    value: OrdinalRegressionPredictionDisplay.LatentScore,
    description:
      'Show the latent variable predictions. You can then compare the predicted values to the thresholds to see how much the subdataset is associated with lower/higher ranks.',
  },
};

export function DefaultOrdinalRegressionPredictionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    OrdinalRegressionResultModel,
    OrdinalRegressionConfigType
  >,
) {
  const { data, config } = props;
  const [display, setDisplay] = React.useState(
    OrdinalRegressionPredictionDisplay.ProbabilityDistribution,
  );
  const renderOption = useDescriptionBasedRenderOption(
    ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY,
  );

  const baselineLayout = usePredictedResultsBaselineLine({
    baseline: data.baseline_prediction.latent_score,
  });
  const latentScorePlot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.independent_variables);

    return {
      data: [
        {
          x: data.predictions.map((prediction) => prediction.variable),
          y: data.predictions.map(
            (prediction) => prediction.prediction.latent_score,
          ),
          type: 'bar',
          customdata: zip(
            data.coefficients.map((coefficient) => coefficient.value),
            data.coefficients.map((coefficient) =>
              formatConfidenceInterval(coefficient.confidence_interval),
            ),
            data.coefficients.map((coefficient) =>
              pValueToConfidenceLevel(coefficient.p_value),
            ),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Predicted Latent Score</b>: %{y:.3f}',
            '='.repeat(30),
            'Coefficient Information',
            '<b>Coefficient</b>: %{customdata[0]:.3f}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]:.3f}%',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: `Predicted Latent Score of ${config.target} per Independent Variable`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
        },
        yaxis: {
          title: `Predicted Latent Score`,
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

  return (
    <Stack>
      <Select
        label="Prediction Type"
        description="Choose the type of prediction data to be displayed."
        required
        value={display}
        data={Object.values(ORDINAL_REGRESSION_PREDICTION_DISPLAY_DICTIONARY)}
        onChange={
          setDisplay as React.Dispatch<React.SetStateAction<string | null>>
        }
        renderOption={renderOption}
        allowDeselect={false}
      />
      <div>
        {display === OrdinalRegressionPredictionDisplay.LatentScore ? (
          <PlotRenderer plot={latentScorePlot} />
        ) : (
          <MultinomialPredictionPlot
            baselinePrediction={data.baseline_prediction}
            levels={data.levels}
            predictions={data.predictions}
            supportsCumulative
            target={config.target}
          />
        )}
      </div>
    </Stack>
  );
}

export const useOrdinalRegressionPredictionAPIHook: RegressionPredictionAPIHookType<
  OrdinalRegressionPredictionResultModel,
  RegressionConfigType
> = function (params) {
  const { input } = params;
  const mutationResult = client.useMutation(
    'post',
    '/statistical-analysis/{project_id}/regression/prediction/ordinal',
  );
  return useAdaptMutationToRegressionPredictionAPIResult<OrdinalRegressionPredictionResultModel>(
    input,
    mutationResult,
  );
};

export function OrdinalRegressionVariablesInfoSection(
  props: BaseStatisticalAnalysisResultRendererProps<
    OrdinalRegressionResultModel,
    RegressionConfigType
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
