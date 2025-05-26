import { LogisticRegressionResultModel } from '@/api/statistic-test';
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
import {
  RegressionVisualizationTypeEnum,
  useRegressionVisualizationTypeSelect,
} from './types';
import { useRegressionVisualizationData } from './data';
import { ResultCard } from '@/components/visual/result-card';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import { BaseStatisticTestResultRendererProps } from '../../types';

const LINEAR_REGRESSION_SUPPORTED_VISUALIZATION_TYPES = [
  ...COMMON_REGRESSION_VISUALIZATION_TYPES,
  RegressionVisualizationTypeEnum.OddsRatio,
];

export default function LogisticRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType
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
    statisticName: 'Z-Statistic',
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
    targetName: config.target.name,
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
