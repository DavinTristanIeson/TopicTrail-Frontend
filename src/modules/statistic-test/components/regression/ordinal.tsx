import { OrdinalRegressionResultModel } from '@/api/statistic-test';
import { BaseStatisticTestResultRendererProps } from '../types';
import {
  useCommonRegressionResultPlot,
  useRegressionVisualizationType,
} from './components';
import { useVisualizationAlphaSlider } from './plot-config';
import { PlotInlineConfiguration } from '@/modules/visualization/components/configuration';
import { Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { RegressionConfigType } from '../configuration/regression-common';

export default function OrdinalRegressionResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    OrdinalRegressionResultModel,
    RegressionConfigType
  >,
) {
  const { data } = props;
  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationSelect, type } =
    useRegressionVisualizationType({
      withOdds: true,
    });
  const plot = useCommonRegressionResultPlot({
    alpha,
    coefficients: data.coefficients,
    withOdds: false,
    statisticName: 'Z-Statistic',
    type,
  });
  return (
    <Stack>
      <PlotInlineConfiguration>
        {VisualizationSelect}
        {AlphaSlider}
      </PlotInlineConfiguration>
      <PlotRenderer plot={plot} />
    </Stack>
  );
}
