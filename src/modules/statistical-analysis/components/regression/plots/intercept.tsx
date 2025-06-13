import {
  LogisticRegressionCoefficientModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionThresholdModel,
} from '@/api/statistical-analysis';
import { formatNumber } from '@/common/utils/number';
import { TaskControlsCard } from '@/modules/task/controls';
import { Text, Group } from '@mantine/core';
import {
  RegressionModelType,
  RegressionParametersVisualizationTypeEnum,
  UltimateRegressionCoefficientModel,
} from '../types';
import { formatConfidenceInterval } from '../utils';
import { ToggleVisibility } from '@/components/visual/toggle-visibility';
import PlotRenderer from '@/components/widgets/plotly';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import {
  getRegressionCoefficientsVisualizationData,
  getRegressionInterceptVisualizationData,
} from '../data';
import {
  useCoefficientRegressionResultPlot,
  useOddsRatioRegressionResultPlot,
} from './coefficients';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { zip } from 'lodash-es';

interface InterceptRendererProps {
  intercept: UltimateRegressionCoefficientModel;
  modelType: RegressionModelType;
  reference: string | null;
}

export function RegressionInterceptResultRenderer(
  props: InterceptRendererProps,
) {
  const { intercept, reference } = props;
  const oddsRatio = (intercept as LogisticRegressionCoefficientModel)
    .odds_ratio;
  const oddsRatioConfidenceInterval = (
    intercept as LogisticRegressionCoefficientModel
  ).odds_ratio_confidence_interval;
  const withOdds = oddsRatio != null;

  return (
    <TaskControlsCard>
      <Group justify="space-between" align="start">
        <div>
          <Text size="md" fw={500}>
            {'Intercept' + (withOdds ? ' (Odds Ratio)' : '')}
          </Text>
          <Text size="xl" fw={500} c="brand" style={{ fontSize: 36 }}>
            {withOdds ? formatNumber(oddsRatio) : formatNumber(intercept.value)}
          </Text>
          <Text size="md" fw={500} c="brand">
            {formatConfidenceInterval(
              withOdds
                ? oddsRatioConfidenceInterval
                : intercept.confidence_interval,
            )}
          </Text>
          {reference && (
            <Text size="md" fw={500}>
              Relative to &quot;{reference}&quot;
            </Text>
          )}
        </div>
      </Group>
    </TaskControlsCard>
  );
}

interface MultinomialLogisticRegressionInterceptsRendererProps {
  type: RegressionParametersVisualizationTypeEnum;
  data: MultinomialLogisticRegressionResultModel;
}

// React.memo prevents this component from rerendering constantly, which causes relayouting issue
export const MultinomialLogisticRegressionInterceptsRenderer = React.memo(
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
        type === RegressionParametersVisualizationTypeEnum.Coefficient
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
      type: RegressionParametersVisualizationTypeEnum.OddsRatio,
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

interface OrdinalRegressionThresholdsRendererProps {
  thresholds: OrdinalRegressionThresholdModel[];
}

export function OrdinalRegressionThresholdsRenderer(
  props: OrdinalRegressionThresholdsRendererProps,
) {
  const { thresholds } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const thresholdNames = thresholds.map(
      (threshold) => `${threshold.from_level} - ${threshold.to_level}`,
    );
    const thresholdValues = thresholds.map((cutpoint) => cutpoint.value);
    const { colors } = generateColorsFromSequence(thresholdNames);

    return {
      data: [
        {
          type: 'bar',
          x: thresholdNames,
          y: thresholdValues,
          marker: {
            color: colors,
          },
          customdata: zip(
            thresholds.map((threshold) => threshold.from_level),
            thresholds.map((threshold) => threshold.to_level),
          ),
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Threshold</b>: %{y:.3f}',
            `<b>From</b>: %{customdata[0]}`,
            `<b>To</b>: %{customdata[1]}`,
          ].join('<br>'),
        },
      ],
      layout: {
        height: 300,
        title: 'Thresholds of the Dependent Variable Levels',
        xaxis: {
          title: 'Levels',
          type: 'category',
        },
        yaxis: {
          title: 'Thresholds',
        },
        barmode: 'stack',
      },
    } as PlotParams;
  }, [thresholds]);

  return (
    <ToggleVisibility label="Thresholds" defaultVisible>
      <div className="w-full">
        <PlotRenderer plot={plot} />
      </div>
    </ToggleVisibility>
  );
}
