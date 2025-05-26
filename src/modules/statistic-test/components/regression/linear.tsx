import { LinearRegressionResultModel } from '@/api/statistic-test';
import {
  COMMON_REGRESSION_VISUALIZATION_TYPES,
  useCommonRegressionResultPlot,
  useEffectOnInterceptRegressionResultPlot,
  useSampleSizeRegressionResultPlot,
  useVarianceInflationFactorRegressionResultPlot,
} from './components';
import {
  PlotInlineConfiguration,
  useVisualizationAlphaSlider,
} from '@/modules/visualization/components/configuration';
import { Group, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { ResultCard } from '@/components/visual/result-card';
import { LinearRegressionConfigType } from '../../configuration/regression';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { useRegressionVisualizationData } from './data';
import { useRegressionVisualizationTypeSelect } from './types';

const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
];

export default function LinearRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LinearRegressionResultModel,
    LinearRegressionConfigType
  >,
) {
  const { data: rawData, config } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationTypeSelect({
      supportedTypes: LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    });
  const data = useRegressionVisualizationData({
    coefficients: rawData.coefficients,
    supportedTypes: LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES,
    statisticName: 'T-Statistic',
  });
  const commonPlot = useCommonRegressionResultPlot({
    alpha,
    type,
    data,
  });
  const effectOnInterceptPlot = useEffectOnInterceptRegressionResultPlot({
    data,
    type,
    intercept: rawData.intercept!,
    targetName: config.target,
    variant: 'linear',
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
  return (
    <Stack>
      <PlotInlineConfiguration>
        {VisualizationSelect}
        {AlphaSlider}
      </PlotInlineConfiguration>
      <Group wrap="wrap">
        <ResultCard label={''} value={undefined} />
      </Group>
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
