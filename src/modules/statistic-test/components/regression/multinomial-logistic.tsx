import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionResultModel,
} from '@/api/statistic-test';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { MultinomialLogisticRegressionConfigType } from '../../configuration/regression';
import { alpha, Select, Stack } from '@mantine/core';
import {
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
import { useRegressionVisualizationData } from './data';
import { type } from 'os';
import { config } from 'process';
import PlotRenderer from '@/components/widgets/plotly';

const MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES =
  [
    RegressionVisualizationTypeEnum.CompareCoefficient,
    RegressionVisualizationTypeEnum.CompareConfidence,
    RegressionVisualizationTypeEnum.CompareOddsRatio,
    RegressionVisualizationTypeEnum.CompareStdErr,
  ];
const MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
  ...MULTINOMIAL_LOGISTIC_REGRESSION_COMPARISON_SUPPORTED_VISUALIZATION_TYPES,
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
    // TODO: facet name
    return facet.name === level;
  });

  return { Component, level, facet };
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
  const { facet, type, alpha, config } = props;
  const data = useRegressionVisualizationData({
    coefficients: facet.coefficients ?? [],
    statisticName: 'Z-Statistic',
    supportedTypes:
      MULTINOMIAL_LOGISTIC_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
  });
  const commonPlot = useCommonRegressionResultPlot({
    alpha,
    type,
    data,
  });
  const effectOnInterceptPlot = useEffectOnInterceptRegressionResultPlot({
    data,
    type,
    intercept: facet.intercept!,
    // TODO: Facet name
    targetName: facet.name,
    variant: 'logistic',
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
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
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

  return (
    <Stack>
      <PlotInlineConfiguration>
        {AlphaSlider}
        {VisualizationSelect}
        {DependentVariableLevelSelect}
      </PlotInlineConfiguration>
      {facet && (
        <MultinomialLogisticRegressionFacetResultRenderer
          alpha={alpha}
          config={config}
          type={type}
          facet={facet}
        />
      )}
    </Stack>
  );
}
