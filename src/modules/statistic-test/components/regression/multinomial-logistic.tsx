import {
  LogisticRegressionCoefficientModel,
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
  COMMON_REGRESSION_VISUALIZATION_TYPES,
  useCommonRegressionResultPlot,
  useEffectOnInterceptRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import { PlotInlineConfiguration } from '@/modules/visualization/components/configuration';
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
    RegressionVisualizationTypeEnum.CompareCoefficient,
    RegressionVisualizationTypeEnum.CompareConfidenceLevel,
    RegressionVisualizationTypeEnum.CompareOddsRatio,
    RegressionVisualizationTypeEnum.CompareEffectsOnIntercept,
  ];
const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
  ...MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.InterceptOddsRatio,
  RegressionVisualizationTypeEnum.FacetSampleSize,
];

interface UseMultinomialLogisticRegressionViewedDependentVariableLevelProps {
  type: RegressionVisualizationTypeEnum;
  result: MultinomialLogisticRegressionResultModel;
}

export function useMultinomialLogisticRegressionViewedDependentVariableLevel(
  props: UseMultinomialLogisticRegressionViewedDependentVariableLevelProps,
) {
  const { type, result } = props;
  const [level, setLevel] = React.useState<string | null>(null);
  const Component =
    !MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES.includes(
      type,
    ) ? (
      <Select
        value={level}
        onChange={setLevel}
        label="Level of Independent Variable"
        description="Choose a specific level (also called category) of the independent variable to be visualized."
        required
      />
    ) : undefined;
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
      !MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES.includes(
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
    if (type === RegressionVisualizationTypeEnum.CompareEffectsOnIntercept) {
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
  return usedPlot && <PlotRenderer plot={usedPlot} />;
}

export default function MultinomialLogisticRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType
  >,
) {
  const { data: rawData, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider({});
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes:
        MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const { Component: DependentVariableLevelSelect, facet } =
    useMultinomialLogisticRegressionViewedDependentVariableLevel({
      type,
      result: rawData,
    });
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

  const interceptPlot = useCommonRegressionResultPlot({
    alpha,
    data: React.useMemo(() => {
      return getRegressionCoefficientsVisualizationData({
        coefficients: rawData.facets.map((facet) => facet.intercept),
        modelType: RegressionModelType.Logistic,
      });
    }, []),
    type,
  });
  const usedPlot = effectOnInterceptPlot ?? compareResultsPlot ?? interceptPlot;

  return (
    <Stack>
      <PlotInlineConfiguration>
        {AlphaSlider}
        {VisualizationSelect}
        {DependentVariableLevelSelect}
      </PlotInlineConfiguration>
      {facet && !usedPlot && (
        <MultinomialLogisticRegressionFacetResultRenderer
          alpha={alpha}
          config={config}
          type={type}
          facet={facet}
        />
      )}
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
