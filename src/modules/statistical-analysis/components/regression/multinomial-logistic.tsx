import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistic-test';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/regression';
import { Group, Select, Stack } from '@mantine/core';
import {
  REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { useVisualizationAlphaSlider } from '../plot-config';
import {
  RegressionConvergenceResultRenderer,
  useCoefficientRegressionResultPlot,
  useConfidenceLevelRegressionResultPlot,
  useEffectOnInterceptRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
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
import {
  getBalancedHeatmapZRange,
  getRawHeatmapZRange,
} from '@/modules/visualization/components/configuration/heatmap';
import { mask2D, transposeMatrix } from '@/common/utils/iterable';
import { ResultCard } from '@/components/visual/result-card';
import { formatConfidenceLevel } from './utils';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';

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
  const configEntry = REGRESSION_VISUALIZATION_TYPE_DICTIONARY[type];

  // 2D. Make sure all 2D is properly transposed.
  const invalidMask = transposeMatrix(
    facetData.map((row) => row.pValues.map((pValue) => pValue > alpha)),
  );
  let grandZ = transposeMatrix(
    facets.map((facet) =>
      facet.coefficients.map((coefficient) => configEntry.select!(coefficient)),
    ),
  );
  if (type !== RegressionVisualizationTypeEnum.ConfidenceLevel) {
    grandZ = mask2D(grandZ, invalidMask, undefined) as number[][];
  }
  const customdata = transposeMatrix(
    facetData.map((facet) => facet.customdata),
  );

  // Axis
  const facetLevels = facets.map((facet) => facet.level);
  const variables = facets[0]!.coefficients.map(
    (coefficient) => coefficient.name,
  );
  const hovertemplate = facetData[0]?.hovertemplate;

  let zmin: number;
  let zmax: number;
  let colorscale = 'Viridis';

  if (type === RegressionVisualizationTypeEnum.ConfidenceLevel) {
    zmin = 0;
    zmax = 100;
  } else if (type === RegressionVisualizationTypeEnum.OddsRatio) {
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
      yaxisTitle,
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
          showscale: true,
          type: 'log',
        },
        xaxis: {
          title: `Levels of ${config.target}`,
        },
        yaxis: {
          title: yaxisTitle,
        },
      },
    };
  }, [alpha, config.target, data.facets, type]);
}

interface MultinomialLogisticRegressionInterceptsRendererProps {
  type: RegressionVisualizationTypeEnum;
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
        modelType: RegressionModelType.Logistic,
      });
      let hovertemplate: string | undefined = undefined;
      const customdata: any[] = [];
      for (const facet of data.facets) {
        const {
          customdata: interceptCustomdata,
          hovertemplate: interceptHovertemplate,
        } = getRegressionInterceptVisualizationData({
          intercept: facet.intercept,
          modelType: RegressionModelType.Logistic,
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
        type === RegressionVisualizationTypeEnum.Coefficient
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
      type: RegressionVisualizationTypeEnum.OddsRatio,
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
  const commonProps = {
    alpha,
    type,
    data,
  };
  const coefficientPlot = useCoefficientRegressionResultPlot(commonProps);
  const confidenceLevelPlot =
    useConfidenceLevelRegressionResultPlot(commonProps);
  const oddsRatioPlot = useOddsRatioRegressionResultPlot(commonProps);
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
    sampleSizePlot ??
    vifPlot ??
    effectOnInterceptPlot ??
    coefficientPlot ??
    confidenceLevelPlot ??
    oddsRatioPlot;
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
      <Group wrap="wrap" align="stretch">
        <ResultCard
          label={'Log-Likelihood Ratio'}
          value={rawData.log_likelihood_ratio?.toFixed(3)}
          info="Measures how much better the fitted model explains the data compared to the null model. Higher is better. Consider using the p-value or McFadden's Pseudo R-Squared to interpret the model fit rather than the Log-Likelihood Ratio as they are more interpretable/comparable."
        />
        <ResultCard
          label={'P-Value'}
          value={rawData.p_value?.toFixed(3)}
          info="Under the assumption that the null model is sufficient to explain the dependent variable, what is the likelihood that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={'Confidence Level'}
          value={formatConfidenceLevel(rawData.p_value)}
          info="How confident are we that the fitted model explains the dependent variable better than the null model?"
        />
        <ResultCard
          label={"McFadden's Pseudo R-Squared"}
          value={rawData.pseudo_r_squared?.toFixed(3)}
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
      <RegressionConvergenceResultRenderer converged={rawData.converged} />
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
            scrollZoom={
              !(
                usedPlot === effectOnInterceptPlot ||
                usedPlot === compareResultsPlot
              )
            }
          />
        )}
      </div>
    </Stack>
  );
}
