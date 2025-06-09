import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/multinomial-regression';
import { Group, Select, Stack } from '@mantine/core';
import {
  REGRESSION_COEFFICIENTS_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
  RegressionPredictionAPIHookType,
  RegressionCoefficientsVisualizationTypeEnum,
  StatisticalAnalysisPredictionResultRendererProps,
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
  useRegressionCoefficientMultiSelect,
} from './components';
import React from 'react';
import {
  getRegressionCoefficientsVisualizationData,
  getRegressionInterceptVisualizationData,
  useAdaptMutationToRegressionPredictionAPIResult,
} from './data';
import PlotRenderer from '@/components/widgets/plotly';
import { PlotParams } from 'react-plotly.js';
import {
  getBalancedHeatmapZRange,
  getRawHeatmapZRange,
} from '@/modules/visualization/components/configuration/heatmap';
import { mask2D } from '@/common/utils/iterable';
import { ResultCard } from '@/components/visual/result-card';
import { pValueToConfidenceLevel } from './utils';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';
import { client } from '@/common/api/client';
import BaseRegressionVariablesInfoSection from './variables-info';
import { MultinomialPredictionPlot } from './multinomial-predictions';
import { RegressionCoefficientsPerFacetTable } from './coefficients-table';

const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionCoefficientsVisualizationTypeEnum.Coefficient,
  RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel,
  RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
];

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
    zmax = getRawHeatmapZRange(grandZ as number[][])[1];
    colorscale = 'Viridis';
  } else {
    [zmin, zmax] = getBalancedHeatmapZRange(grandZ as number[][]);
    colorscale = 'RdBu';
  }

  return {
    configEntry,
    facetData,
    invalidMask,
    z: grandZ,
    x: variables,
    y: facetLevels,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          texttemplate:
            '%{z:.3f}' +
            (type ===
            RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel
              ? '%'
              : ''),
          hoverongaps: false,
          zmin,
          zmax,
          customdata: customdata as any,
          showlegend: false,
          hovertemplate,
          type: 'heatmap',
          colorbar: {
            title: configEntry.plotLabel,
          },
          colorscale,
        },
      ] as PlotParams['data'],
      layout: {
        title: configEntry.label,
        xaxis: {
          title: `Levels of ${config.target}`,
          type: 'category',
        },
        yaxis: {
          title: yaxisTitle,
          type: 'category',
        },
      },
    } as PlotParams;
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
      const coefficients = data.facets.map((facet) => {
        return {
          ...facet.intercept,
          name: facet.level,
        };
      });
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
      return [
        {
          name: 'Intercepts',
          data: {
            ...visdata,
            customdata: customdata,
            hovertemplate: hovertemplate!,
          },
        },
      ];
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
      } as PlotParams['layout'],
    });
    const oddsPlot = useOddsRatioRegressionResultPlot({
      alpha: 1,
      data: visdata,
      type: RegressionCoefficientsVisualizationTypeEnum.OddsRatio,
      layout: {
        title: 'Base Odds Ratio of Intercepts',
      } as PlotParams['layout'],
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
  const usedPlot = coefficientPlot ?? confidenceLevelPlot ?? oddsRatioPlot;

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

  if (type === RegressionCoefficientsVisualizationTypeEnum.Table) {
    return (
      <Stack>
        {Header}
        <RegressionCoefficientsPerFacetTable facets={data.facets} />
      </Stack>
    );
  }

  return (
    <Stack>
      {VisualizationSelect}
      {AlphaSlider}
      {CoefficientMultiSelect}
      <MultinomialLogisticRegressionInterceptsRenderer
        type={type}
        data={data}
      />
      <div>
        {usedPlot && (
          <PlotRenderer plot={usedPlot} height={720} scrollZoom={false} />
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
