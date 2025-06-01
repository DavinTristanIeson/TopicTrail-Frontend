import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/regression';
import { Group, Select, Stack } from '@mantine/core';
import {
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionCoefficientsVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
  useAdaptMutationToRegressionPredictionAPIResult,
  useRegressionVisualizationTypeSelect,
  RegressionVariableInfoVisualizationType,
} from './types';
import { useVisualizationAlphaSlider } from '../plot-config';
import {
  PredictedProbabilityDistributionPlot,
  RegressionConvergenceResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
} from './components';
import React from 'react';
import {
  getRegressionCoefficientsVisualizationData,
  getRegressionInterceptVisualizationData,
} from './data';
import PlotRenderer from '@/components/widgets/plotly';
import { PlotParams } from 'react-plotly.js';
import {
  getBalancedHeatmapZRange,
  getRawHeatmapZRange,
} from '@/modules/visualization/components/configuration/heatmap';
import { mask2D } from '@/common/utils/iterable';
import { ResultCard } from '@/components/visual/result-card';
import {
  formatConfidenceInterval,
  formatConfidenceLevel,
  pValueToConfidenceLevel,
} from './utils';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';
import { zip } from 'lodash-es';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';

const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionCoefficientsVisualizationTypeEnum.Coefficient,
  RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel,
  RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
];

enum ConfidenceIntervalDisplay {
  LowerBound = 'lower-bound',
  Value = 'value',
  UpperBound = 'upper-bound',
}

function useMultinomialLogisticConfidenceIntervalDisplay() {
  const [display, setDisplay] = React.useState(ConfidenceIntervalDisplay.Value);
  const Component = (
    <Select
      label="Display which value?"
      description="Pick which value of the coefficient/odds ratio to be displayed, such as the lower bound, value, or the upper bound of the confidence interval."
      data={}
    />
  );
  return display;
}

interface UseMultinomialLogisticRegressionViewedDependentVariableLevelProps {
  result: MultinomialLogisticRegressionResultModel;
}

export function useMultinomialLogisticRegressionViewedDependentVariableLevel(
  props: UseMultinomialLogisticRegressionViewedDependentVariableLevelProps,
) {
  const { result } = props;
  const levels = React.useMemo(
    () => result.facets.map((facet) => facet.level),
    [result.facets],
  );
  const [level, setLevel] = React.useState<string | null>(null);
  const inputContainer = useSelectLeftRightButtons({
    onChange: setLevel,
    options: levels,
    value: level,
  });
  const Component = (
    <Select
      value={level}
      onChange={setLevel}
      data={levels}
      label="Level of Dependent Variable"
      description="Choose a specific level (also called category) of the independent variable to be visualized."
      inputContainer={inputContainer}
      clearable
    />
  );
  const facet = result.facets.find((facet) => {
    return facet.level === level;
  });

  return { Component, level, facet };
}

interface PrepareCompareFacetsCoefficientsDataParams {
  facets: MultinomialLogisticRegressionFacetResultModel[];
  type: RegressionCoefficientsVisualizationTypeEnum;
  alpha: number;
}

function prepareCompareFacetsCoefficientsData(
  params: PrepareCompareFacetsCoefficientsDataParams,
) {
  const { facets, type, alpha } = params;
  const facetData = facets.map((facet) =>
    getRegressionCoefficientsVisualizationData({
      coefficients: facet.coefficients,
      modelType: RegressionModelType.MultinomialLogistic,
    }),
  );
  const configEntry =
    REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY[type];

  // 2D. Make sure all 2D is properly transposed.
  const invalidMask = facetData.map((row) =>
    row.pValues.map((pValue) => pValue > alpha),
  );
  let grandZ = facets.map((facet) =>
    facet.coefficients.map((coefficient) => {
      switch (type) {
        case RegressionCoefficientsVisualizationTypeEnum.Coefficient: {
          return coefficient.value;
        }
        case RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel: {
          return pValueToConfidenceLevel(coefficient.p_value);
        }
        case RegressionCoefficientsVisualizationTypeEnum.OddsRatio: {
          return coefficient.odds_ratio;
        }
        default: {
          throw new Error(`Unsupported visualization type: ${type}`);
        }
      }
    }),
  );
  if (type !== RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel) {
    grandZ = mask2D(grandZ, invalidMask, undefined) as number[][];
  }
  const customdata = facetData.map((facet) => facet.customdata);

  // Axis
  const facetLevels = facets.map((facet) => facet.level);
  const variables = facets[0]!.coefficients.map(
    (coefficient) => coefficient.name,
  );
  const hovertemplate = facetData[0]?.hovertemplate;

  let zmin: number;
  let zmax: number;
  let colorscale = 'Viridis';

  if (type === RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel) {
    zmin = 0;
    zmax = 100;
  } else if (type === RegressionCoefficientsVisualizationTypeEnum.OddsRatio) {
    zmin = 0;
    zmax = getRawHeatmapZRange(grandZ)[1];
    colorscale = 'Viridis';
  } else {
    [zmin, zmax] = getBalancedHeatmapZRange(grandZ);
    colorscale = 'RdBu';
  }

  return {
    configEntry,
    facetData,
    invalidMask,
    z: grandZ,
    // Facets to the right
    x: facetLevels,
    // Subdatasets to the side
    y: variables,
    customdata,
    hovertemplate,
    zmin,
    zmax,
    yaxisTitle: facetData[0]?.xaxisTitle,
    colorscale,
  };
}

interface UseCompareLogisticRegressionResultPlotProps {
  data: MultinomialLogisticRegressionResultModel;
  type: RegressionCoefficientsVisualizationTypeEnum;
  config: MultinomialLogisticRegressionConfigType;
  alpha: number;
}

function useCompareLogisticRegressionResultPlot(
  props: UseCompareLogisticRegressionResultPlotProps,
) {
  const { data, type, config, alpha } = props;
  return React.useMemo<PlotParams | null>(() => {
    if (data.facets.length === 0) {
      return null;
    }
    const {
      x,
      y,
      z,
      invalidMask,
      zmin,
      zmax,
      customdata,
      hovertemplate,
      configEntry,
      yaxisTitle,
      colorscale,
    } = prepareCompareFacetsCoefficientsData({
      alpha,
      type,
      facets: data.facets,
    });

    return {
      data: [
        {
          x,
          y,
          z: mask2D(z, invalidMask, undefined) as number[][],
          hoverongaps: false,
          zmin,
          zmax,
          customdata: customdata as any,
          showlegend: false,
          hovertemplate,
          type: 'heatmap',
        },
      ] as PlotParams['data'],
      layout: {
        title: configEntry.label,
        xaxis: {
          title: `Levels of ${config.target}`,
        },
        yaxis: {
          title: yaxisTitle,
        },
        coloraxis: {
          colorbar: {
            title: configEntry.plotLabel,
          },
          colorscale,
        },
      },
    };
  }, [alpha, config.target, data.facets, type]);
}

interface MultinomialLogisticRegressionInterceptsRendererProps {
  type: RegressionCoefficientsVisualizationTypeEnum;
  data: MultinomialLogisticRegressionResultModel;
}

// React.memo prevents this component from rerendering constantly, which causes relayouting issue
const MultinomialLogisticRegressionInterceptsRenderer = React.memo(
  function MultinomialLogisticRegressionInterceptsRenderer(
    props: MultinomialLogisticRegressionInterceptsRendererProps,
  ) {
    const { data, type } = props;
    const visdata = React.useMemo(() => {
      const coefficients = data.facets.map((facet) => facet.intercept);
      const visdata = getRegressionCoefficientsVisualizationData({
        coefficients,
        modelType: RegressionModelType.MultinomialLogistic,
      });
      let hovertemplate: string | undefined = undefined;
      const customdata: any[] = [];
      for (const facet of data.facets) {
        const {
          customdata: interceptCustomdata,
          hovertemplate: interceptHovertemplate,
        } = getRegressionInterceptVisualizationData({
          intercept: facet.intercept,
          modelType: RegressionModelType.MultinomialLogistic,
        });
        customdata.push(interceptCustomdata[0]);
        hovertemplate = interceptHovertemplate;
      }
      return {
        ...visdata,
        customdata: customdata,
        hovertemplate: hovertemplate!,
      };
    }, [data.facets]);

    const coefficientPlot = useCoefficientRegressionResultPlot({
      alpha: 1,
      data: visdata,
      type:
        type === RegressionCoefficientsVisualizationTypeEnum.Coefficient
          ? type
          : ('' as any),
      layout: {
        title: 'Intercepts',
        yaxis: {
          title: 'Intercepts',
        },
      },
    });
    const oddsPlot = useOddsRatioRegressionResultPlot({
      alpha: 1,
      data: visdata,
      type: RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
      layout: {
        title: 'Base Odds Ratio of Intercepts',
      },
    });
    const usedPlot = coefficientPlot ?? oddsPlot;

    if (!usedPlot) return;
    return (
      <ToggleVisibility label="Intercepts" defaultVisible>
        <div className="w-full">
          <PlotRenderer plot={usedPlot} key={type} />
        </div>
      </ToggleVisibility>
    );
  },
);

interface MultinomialLogisticRegressionFacetResultRendererProps {
  facet: MultinomialLogisticRegressionFacetResultModel;
  config: MultinomialLogisticRegressionConfigType;
  type: RegressionCoefficientsVisualizationTypeEnum;
  alpha: number;
}

function MultinomialLogisticRegressionFacetResultRenderer(
  props: MultinomialLogisticRegressionFacetResultRendererProps,
) {
  const { facet, type, alpha } = props;
  const data = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: facet.coefficients,
      modelType: RegressionModelType.MultinomialLogistic,
    });
  }, [facet.coefficients]);
  const commonProps = {
    alpha,
    type,
    data,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);
  const oddsRatioPlot = useOddsRatioRegressionResultPlot(commonProps);
  const usedPlot = coefficientPlot ?? confidenceLevelPlot ?? oddsRatioPlot;
  return usedPlot && <PlotRenderer plot={usedPlot} height={720} />;
}

export function MultinomialLogisticRegressionCoefficientsPlot(
  props: BaseStatisticalAnalysisResultRendererProps<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { data: rawData, config } = props;

  // Constraints
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: DependentVariableLevelSelect, facet } =
    useMultinomialLogisticRegressionViewedDependentVariableLevel({
      result: rawData,
    });
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes:
        MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
      dictionary: REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
    });

  // Plots
  const compareResultsPlot = useCompareLogisticRegressionResultPlot({
    data: rawData,
    type,
    alpha,
    config,
  });

  const usedPlot = compareResultsPlot;

  return (
    <Stack>
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={rawData.fit_evaluation.log_likelihood_ratio?.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.fit_evaluation.p_value?.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(rawData.fit_evaluation.p_value)}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={rawData.fit_evaluation.pseudo_r_squared?.toFixed(3)}
          info="Measures how much the independent variables help with predicting the dependent variables. McFadden's pseudo R-squared has a scale of 0 to 1, with higher numbers representing a better explanatory power. To be exact, it measures the % improvement in log-likelihood for the fitted model over the null model."
        />
        <ResultCard
          label={'Sample Size'}
          value={rawData.sample_size}
          info="The number of rows used to fit the regression model."
        />
      </Group>
      <Group>
        {rawData.reference && (
          <ResultCard
            label={'Independent Variable Reference'}
            value={rawData.reference}
            info="The independent variable used as the reference variable."
            miw={512}
          />
        )}
        {rawData.reference_dependent && (
          <ResultCard
            label={'Dependent Variable Level Reference'}
            value={rawData.reference_dependent}
            info="The level of dependent variable used as the reference level."
            miw={512}
          />
        )}
      </Group>
      <RegressionConvergenceResultRenderer
        converged={rawData.fit_evaluation.converged}
      />
      {VisualizationSelect}
      {DependentVariableLevelSelect}
      {AlphaSlider}
      <MultinomialLogisticRegressionInterceptsRenderer
        type={type}
        data={rawData}
      />
      <div>
        {facet && (
          <MultinomialLogisticRegressionFacetResultRenderer
            alpha={alpha}
            config={config}
            type={type}
            facet={facet}
          />
        )}
        {!facet && usedPlot && (
          <PlotRenderer
            plot={usedPlot}
            height={720}
            scrollZoom={usedPlot === compareResultsPlot}
          />
        )}
      </div>
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
  const plot = React.useMemo<PlotParams>(() => {
    const x = [
      'Baseline',
      ...data.independent_variables.map((variable) => variable.name),
    ];
    const y = data.levels.map((level) => level.name);
    const z = zip(data.baseline_prediction.probabilities, data.predictions).map(
      ([baseline, prediction]) => {
        console.log(prediction);
        return [
          baseline! * 100,
          ...prediction!.probabilities.map((probability) => probability * 100),
        ];
      },
    );
    const pValues = data.facets.map((facet) =>
      facet.coefficients.map((coefficient) => coefficient.p_value),
    );
    const customdata = zip(
      data.facets.map((facet) => [
        'None',
        ...facet.coefficients.map((coefficient) => coefficient.odds_ratio),
      ]),
      data.facets.map((facet) => [
        'None',
        ...facet.coefficients.map((coefficient) =>
          formatConfidenceInterval(coefficient.odds_ratio_confidence_interval),
        ),
      ]),
      pValues.map((facet) => ['None', ...facet.map(pValueToConfidenceLevel)]),
    );

    return {
      data: [
        {
          x,
          y,
          z,
          zmin: 0,
          zmax: 100,
          type: 'heatmap',
          texttemplate: '%{z:.3f}%',
          customdata: customdata as any,
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Dependent Variable Level</b>: %{y}',
            '<b>Predicted Probability</b>: %{z}%',
            '='.repeat(30),
            '<b>Odds Ratio</b>: %{customdata[0]}',
            '<b>Confidence Interval</b>: %{customdata[1]}',
            '<b>Confidence Level</b>: %{customdata[2]}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: `Predicted Probabilities for Levels of ${config.target}`,
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: `Dependent Variable Levels`,
        },
      },
    } as PlotParams;
  }, [
    data.independent_variables,
    data.levels,
    data.baseline_prediction.probabilities,
    data.predictions,
    data.facets,
    config.target,
  ]);
  return <PlotRenderer plot={plot} />;
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
