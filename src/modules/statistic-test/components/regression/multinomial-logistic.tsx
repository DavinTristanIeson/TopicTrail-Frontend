import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistic-test';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/regression';
import { Select, Stack } from '@mantine/core';
import {
  REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { useVisualizationAlphaSlider } from '../plot-config';
import {
  RegressionConvergenceResultRenderer,
  useEffectOnInterceptRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import React from 'react';
import {
  getRegressionCoefficientsVisualizationData,
  getRegressionInterceptVisualizationData,
} from './data';
import PlotRenderer from '@/components/widgets/plotly';
import { PlotParams } from 'react-plotly.js';
import { zip } from 'lodash-es';
import { getBalancedHeatmapZRange } from '@/modules/visualization/components/configuration/heatmap';
import { mask2D } from '@/common/utils/iterable';

const MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES =
  [
    RegressionVisualizationTypeEnum.Coefficient,
    RegressionVisualizationTypeEnum.ConfidenceLevel,
    RegressionVisualizationTypeEnum.OddsRatio,
    RegressionVisualizationTypeEnum.EffectOnIntercept,
  ];
const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
  RegressionVisualizationTypeEnum.VarianceInflationFactor,
  RegressionVisualizationTypeEnum.LevelSampleSize,
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
  const [level, setLevel] = React.useState<string | null>(levels[0] ?? null);
  const Component = (
    <Select
      value={level}
      onChange={setLevel}
      data={levels}
      label="Level of Dependent Variable"
      description="Choose a specific level (also called category) of the independent variable to be visualized."
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
  type: RegressionVisualizationTypeEnum;
  alpha: number;
}

function prepareCompareFacetsCoefficientsData(
  params: PrepareCompareFacetsCoefficientsDataParams,
) {
  const { facets, type, alpha } = params;
  const facetData = facets.map((facet) =>
    getRegressionCoefficientsVisualizationData({
      coefficients: facet.coefficients,
      modelType: RegressionModelType.Logistic,
    }),
  );
  const invalidMask = facetData.map((row) =>
    row.pValues.map((pValue) => pValue > alpha),
  );

  const configEntry = REGRESSION_VISUALIZATION_TYPE_DICTIONARY[type];
  const grandZ = facets.map((facet) =>
    facet.coefficients.map((coefficient) => configEntry.select!(coefficient)),
  );
  const facetLevels = facets.map((facet) => facet.level);
  const variables = facets[0]!.coefficients.map(
    (coefficient) => coefficient.name,
  );
  const customdata = facetData.map((facet) => facet.customdata);
  const hovertemplate = facetData[0]?.hovertemplate;

  const [minZ, maxZ] = getBalancedHeatmapZRange(grandZ as number[][]);

  return {
    configEntry,
    facetData,
    invalidMask,
    z: grandZ,
    y: facetLevels,
    x: variables,
    customdata,
    hovertemplate,
    zmin: minZ,
    zmax: maxZ,
    xaxisTitle: facetData[0]?.xaxisTitle,
  };
}

interface UseCompareLogisticRegressionResultPlotProps {
  data: MultinomialLogisticRegressionResultModel;
  type: RegressionVisualizationTypeEnum;
  config: MultinomialLogisticRegressionConfigType;
  alpha: number;
}

function useCompareLogisticRegressionResultPlot(
  props: UseCompareLogisticRegressionResultPlotProps,
) {
  const { data, type, config, alpha } = props;
  return React.useMemo<PlotParams | null>(() => {
    if (
      !MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES.includes(
        type,
      )
    ) {
      return null;
    }
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
      xaxisTitle,
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
          colorbar: {
            title: configEntry.plotLabel,
          },
          colorscale: 'RdBu',
        },
      ] as PlotParams['data'],
      layout: {
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: `Levels of ${config.target}`,
        },
      },
    };
  }, [alpha, config.target, data.facets, type]);
}

function useMultinomialLogisticRegressionEffectsOnIntercept(
  props: UseCompareLogisticRegressionResultPlotProps,
) {
  const { data, type, config, alpha } = props;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.EffectOnIntercept) {
      return null;
    }
    if (data.facets.length === 0) {
      return null;
    }
    const {
      x: coefficientsX,
      y,
      z: coefficientsZ,
      invalidMask,
      zmin,
      zmax,
      customdata,
      hovertemplate: coefficientsHovertemplate,
      configEntry,
      xaxisTitle,
    } = prepareCompareFacetsCoefficientsData({
      alpha,
      type,
      facets: data.facets,
    });
    const interceptData = data.facets.map((facet) =>
      getRegressionInterceptVisualizationData({
        intercept: facet.intercept,
        modelType: RegressionModelType.Logistic,
      }),
    );
    const interceptCustomdata = interceptData.map((intercept) => [
      intercept.customdata,
    ]);
    const interceptOddsRatio = data.facets.map((facet) => [
      facet.intercept.odds_ratio,
    ]);
    const interceptHovertemplate = interceptData[0]?.hovertemplate;

    const x = ['Intercept', ...coefficientsX];
    const z = zip(data.facets, coefficientsZ).map(([facet, zRow]) => {
      const intercept = facet!.intercept.odds_ratio;
      return zRow!.map((z) => z * intercept);
    });
    const hovertemplate =
      'Intercept + Effect: %{z} (Odds Ratio)<br>' + coefficientsHovertemplate;

    return {
      data: [
        {
          x: ['Intercept'],
          y,
          z: interceptOddsRatio,
          customdata: interceptCustomdata,
          hovertemplate: interceptHovertemplate,
          showlegend: false,
        },
        {
          x,
          y,
          z: mask2D(z, invalidMask, undefined) as number[][],
          hoverongaps: false,
          zmin,
          zmax,
          customdata: customdata as any,
          showlegend: false,
          hovertemplate: hovertemplate,
          type: 'heatmap',
        },
      ],
      layout: {
        coloraxis: {
          colorbar: {
            title: configEntry.plotLabel,
          },
          colorscale: 'Viridis',
        },
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: `Levels of ${config.target}`,
        },
      },
    };
  }, [alpha, config.target, data.facets, type]);
}

interface MultinomialLogisticRegressionInterceptsRendererProps {
  type: RegressionVisualizationTypeEnum;
  data: MultinomialLogisticRegressionResultModel;
}

function MultinomialLogisticRegressionInterceptsRenderer(
  props: MultinomialLogisticRegressionInterceptsRendererProps,
) {
  const { data, type } = props;
  const interceptPlot = useCommonRegressionResultPlot({
    alpha: 0,
    data: React.useMemo(() => {
      return getRegressionCoefficientsVisualizationData({
        coefficients: data.facets.map((facet) => facet.intercept),
        modelType: RegressionModelType.Logistic,
      });
    }, [data.facets]),
    type:
      type === RegressionVisualizationTypeEnum.Coefficient
        ? type
        : RegressionVisualizationTypeEnum.OddsRatio,
    layout: {
      title:
        type === RegressionVisualizationTypeEnum.Coefficient
          ? 'Intercepts'
          : 'Base Odds Ratios of Intercepts',
    },
  });
  if (!interceptPlot) return;
  return <PlotRenderer plot={interceptPlot} />;
}

interface MultinomialLogisticRegressionFacetResultRendererProps {
  facet: MultinomialLogisticRegressionFacetResultModel;
  config: MultinomialLogisticRegressionConfigType;
  type: RegressionVisualizationTypeEnum;
  alpha: number;
}

function MultinomialLogisticRegressionFacetResultRenderer(
  props: MultinomialLogisticRegressionFacetResultRendererProps,
) {
  const { facet, type, alpha } = props;
  const data = React.useMemo(() => {
    return getRegressionCoefficientsVisualizationData({
      coefficients: facet.coefficients,
      modelType: RegressionModelType.Logistic,
    });
  }, [facet.coefficients]);
  const commonPlot = useCommonRegressionResultPlot({
    alpha,
    type,
    data,
  });
  const effectOnInterceptPlot = useEffectOnInterceptRegressionResultPlot({
    data,
    type,
    intercept: facet.intercept!,
    targetName: facet.level,
    modelType: RegressionModelType.Logistic,
  });
  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    data,
    type,
  });
  const sampleSizePlot = useSampleSizeRegressionResultPlot({
    data,
    type,
  });
  const usedPlot =
    sampleSizePlot ?? vifPlot ?? effectOnInterceptPlot ?? commonPlot;
  return usedPlot && <PlotRenderer plot={usedPlot} height={720} />;
}

export default function MultinomialLogisticRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
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
        facet == null
          ? MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES
          : MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });

  // Plots
  const effectOnInterceptPlot =
    useMultinomialLogisticRegressionEffectsOnIntercept({
      data: rawData,
      type,
      alpha,
      config,
    });
  const compareResultsPlot = useCompareLogisticRegressionResultPlot({
    data: rawData,
    type,
    alpha,
    config,
  });

  const usedPlot = effectOnInterceptPlot ?? compareResultsPlot;

  return (
    <Stack>
      {VisualizationSelect}
      {DependentVariableLevelSelect}
      {AlphaSlider}
      <RegressionConvergenceResultRenderer converged={rawData.converged} />
      <MultinomialLogisticRegressionInterceptsRenderer
        type={type}
        data={rawData}
      />
      {facet && !usedPlot && (
        <MultinomialLogisticRegressionFacetResultRenderer
          alpha={alpha}
          config={config}
          type={type}
          facet={facet}
        />
      )}
      {usedPlot && <PlotRenderer plot={usedPlot} height={720} />}
    </Stack>
  );
}
