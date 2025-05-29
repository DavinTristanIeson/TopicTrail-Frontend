import { LogisticRegressionCoefficientModel } from '@/api/statistic-test';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import {
  Button,
  Group,
  Modal,
  Table,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { unzip, zip } from 'lodash-es';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  UltimateRegressionCoefficientModel,
  RegressionVisualizationTypeEnum,
  REGRESSION_VISUALIZATION_TYPE_DICTIONARY,
  RegressionModelType,
} from './types';
import {
  getRegressionInterceptVisualizationData,
  RegressionVisualizationData,
} from './data';
import { CheckCircle, Info, XCircle } from '@phosphor-icons/react';
import { TaskControlsCard } from '@/modules/task/controls';
import { useDisclosure } from '@mantine/hooks';

interface UseCommonRegressionResultPlotProps {
  type: RegressionVisualizationTypeEnum;
  alpha: number;
  data: RegressionVisualizationData;
  layout?: PlotParams['layout'];
}

export const COMMON_REGRESSION_VISUALIZATION_TYPES = [
  RegressionVisualizationTypeEnum.Coefficient,
  RegressionVisualizationTypeEnum.ConfidenceLevel,
  RegressionVisualizationTypeEnum.OddsRatio,
  RegressionVisualizationTypeEnum.InterceptOddsRatio,
  RegressionVisualizationTypeEnum.EffectOnIntercept,
];
export function useCommonRegressionResultPlot(
  props: UseCommonRegressionResultPlotProps,
) {
  const { data, type, alpha, layout: extraLayout } = props;
  const mantineColors = useMantineTheme().colors;
  const plot = React.useMemo<PlotParams | null>(() => {
    const configEntry = REGRESSION_VISUALIZATION_TYPE_DICTIONARY[type];
    if (!COMMON_REGRESSION_VISUALIZATION_TYPES.includes(type)) {
      return null;
    }
    if (configEntry == null) {
      throw new Error(`${type} is not a valid regression visualization type.`);
    }

    const {
      customdata,
      hovertemplate,
      coefficients,
      values: coefficientValues,
      pValues,
      variables: x,
      xaxisTitle,
      confidenceIntervals,
    } = data;
    const y = coefficients.map((coefficient) =>
      configEntry.select!(coefficient),
    ) as number[];
    const { colors: generatedColors } = generateColorsFromSequence(x);
    const colors = zip(generatedColors, pValues).map(([color, pValue]) => {
      if (pValue! < alpha) {
        return color!;
      }
      return mantineColors.gray[6];
    });
    const [confidenceIntervalMinus, confidenceIntervalPlus] = unzip(
      zip(coefficientValues, confidenceIntervals).map(
        ([coefficient, interval]) => {
          if (interval![0] == null || interval![1] == null) {
            return [undefined, undefined];
          }
          return [
            // value - lower
            coefficient! - interval![0],
            // upper - value
            interval![1] - coefficient!,
          ];
        },
      ),
    );

    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          marker: {
            color: colors,
          },
          base:
            type === RegressionVisualizationTypeEnum.OddsRatio ||
            type === RegressionVisualizationTypeEnum.InterceptOddsRatio
              ? 1
              : undefined,
          error_y:
            type === RegressionVisualizationTypeEnum.Coefficient
              ? {
                  type: 'data',
                  symmetric: false,
                  array: confidenceIntervalMinus,
                  arrayminus: confidenceIntervalPlus,
                  visible: true,
                }
              : undefined,
          customdata: customdata as any,
          hovertemplate,
        } as PlotParams['data'][number],
      ],
      layout: {
        title: configEntry.label,
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title: configEntry.plotLabel,
        },
        ...extraLayout,
      },
    } as PlotParams;
  }, [alpha, data, extraLayout, mantineColors.gray, type]);
  return plot;
}

interface UseRegressionStatisticPlotProps {
  data: RegressionVisualizationData;
  type: RegressionVisualizationTypeEnum;
}

export function useSampleSizeRegressionResultPlot(
  props: UseRegressionStatisticPlotProps,
) {
  const { data, type } = props;
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.SampleSize) {
      return null;
    }
    const { hovertemplate, customdata, sampleSizes, variables: x } = data;
    return {
      data: [
        {
          x,
          y: sampleSizes,
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(x).colors,
          },
          customdata,
          hovertemplate,
        },
      ],
      layout: {
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: 'Sample Size',
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [data, type]);
  return plot;
}

interface UseVarianceInflationFactorRegressionResultPlotProps {
  type: RegressionVisualizationTypeEnum;
  data: RegressionVisualizationData;
}

export function useVarianceInflationFactorRegressionResultPlot(
  props: UseVarianceInflationFactorRegressionResultPlotProps,
) {
  const { type, data } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.VarianceInflationFactor) {
      return null;
    }
    const { varianceInflationFactors, variables, hovertemplate, customdata } =
      data;
    const VIFlineAnnotations: PlotParams['layout']['annotations'] = [
      {
        x: 0.1,
        xref: 'paper',
        y: 5,
        yref: 'y',
        text: 'Strong Multicollinearity',
      },
    ];
    const VIFlineShapes: PlotParams['layout']['shapes'] = [
      {
        type: 'line',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: 5,
        y1: 5,
        line: {
          color: mantineColors.yellow[6],
          width: 3,
          dash: 'dash',
        },
      },
    ];
    return {
      data: [
        {
          x: variables,
          y: varianceInflationFactors,
          type: 'bar',
          hovertemplate,
          customdata,
          marker: {
            color: generateColorsFromSequence(variables).colors,
          },
        },
      ],
      layout: {
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
        },
        yaxis: {
          title: 'Variance Inflation Factory',
          minallowed: 0,
          range: [0, 6],
        },
        annotations: VIFlineAnnotations,
        shapes: VIFlineShapes,
      },
    } as PlotParams;
  }, [data, mantineColors.yellow, type]);
}

interface UseInterceptEffectsPlotProps {
  intercept: UltimateRegressionCoefficientModel;
  data: RegressionVisualizationData;
  type: RegressionVisualizationTypeEnum;
  targetName: string;
  modelType: RegressionModelType;
}

export function useEffectOnInterceptRegressionResultPlot(
  props: UseInterceptEffectsPlotProps,
) {
  const { intercept, data, type, modelType, targetName } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVisualizationTypeEnum.EffectOnIntercept) {
      return null;
    }
    const {
      variables,
      oddsRatios: oddsRatios,
      values,
      xaxisTitle,
      customdata,
      hovertemplate,
    } = data;
    let y: number[];
    const useOdds = modelType === RegressionModelType.Logistic;
    const interceptOdds = (intercept as LogisticRegressionCoefficientModel)
      .odds_ratio;
    console.log(oddsRatios, intercept);
    if (useOdds) {
      if (oddsRatios == null || interceptOdds == null) {
        throw new Error(
          'Odds ratios are not provided. This may be a developer oversight',
        );
      }
      // odds ratio relationship is multiplicative. Technically, the coefficient still has an additive relationship to the intercept, but the coefficient uses log-odds (where multiplication = addition) so it's multiplicative when we transform them into odds ratio.
      y = oddsRatios.map((odds_ratio) => interceptOdds * odds_ratio);
    } else {
      y = values.map((value) => intercept.value + value);
    }
    const {
      hovertemplate: interceptHovertemplate,
      customdata: interceptCustomdata,
    } = getRegressionInterceptVisualizationData({
      intercept,
      modelType,
    });
    const interceptValue = useOdds ? interceptOdds : intercept.value;
    return {
      data: [
        {
          name: 'Intercept',
          x: ['Intercept'],
          y: [interceptValue],
          hovertemplate: interceptHovertemplate,
          customdata: interceptCustomdata,
          marker: {
            color: mantineColors.brand[6],
          },
          showlegend: false,
        },
        {
          name: 'Coefficients',
          showlegend: false,
          x: variables,
          y,
          base: interceptValue,
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(variables).colors,
          },
          customdata,
          hovertemplate,
        },
      ],
      layout: {
        title: 'Effect on Intercept',
        xaxis: {
          title: xaxisTitle,
        },
        yaxis: {
          title:
            modelType == 'linear'
              ? `Mean of ${targetName}`
              : modelType == 'logistic'
                ? `Odds of Predicting ${targetName}`
                : undefined,
        },
        shapes: [
          {
            type: 'line',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            x1: 1,
            y0: interceptValue,
            y1: interceptValue,
            line: {
              color: mantineColors.brand[6],
              width: 3,
              dash: 'dash',
            },
          },
        ],
      },
    } as PlotParams;
  }, [data, intercept, mantineColors.brand, targetName, type, modelType]);
}
interface InterceptRendererProps {
  intercept: UltimateRegressionCoefficientModel;
  statisticName: string;
  reference: string | null;
}

export function RegressionInterceptResultRenderer(
  props: InterceptRendererProps,
) {
  const { intercept, statisticName, reference } = props;
  const oddsRatio = (intercept as LogisticRegressionCoefficientModel)
    .odds_ratio;
  const withOdds = oddsRatio != null;
  const interceptData = [
    {
      label: 'Value',
      value: intercept.value,
    },
    {
      label: 'Std. Err',
      value: intercept.std_err,
    },
    {
      label: statisticName,
      value: intercept.statistic.toFixed(3),
    },
    {
      label: 'P-Value',
      value: intercept.p_value.toFixed(3),
    },
    {
      label: 'Confidence Level',
      value: `${(100 * (1 - intercept.p_value)).toFixed(3)}%`,
    },
    {
      label: 'Confidence Interval (Alpha = 0.05)',
      value: `${intercept.confidence_interval[0].toFixed(3)} - ${intercept.confidence_interval[1].toFixed(3)}`,
    },
  ];

  const [opened, { toggle, close: onClose }] = useDisclosure();
  return (
    <TaskControlsCard>
      <Group justify="space-between" align="start">
        <div>
          <Text size="md" fw={500}>
            {'Intercept' + (withOdds ? ' (Odds Ratio)' : '')}
          </Text>
          <Text size="xl" fw={500} c="brand" style={{ fontSize: 36 }}>
            {withOdds ? oddsRatio.toFixed(3) : intercept.value.toFixed(3)}
          </Text>
          {reference && (
            <Text size="md" fw={500}>
              Relative to &quot;{reference}&quot;
            </Text>
          )}
        </div>
        <Button leftSection={<Info />} onClick={toggle} variant="subtle">
          View Info
        </Button>
      </Group>
      <Modal opened={opened} onClose={onClose} title="Intercept Information">
        <Table>
          {interceptData.map((row) => (
            <Table.Tr key={row.label}>
              <Table.Th>{row.label}</Table.Th>
              <Table.Td>{row.value}</Table.Td>
            </Table.Tr>
          ))}
        </Table>
      </Modal>
    </TaskControlsCard>
  );
}

interface RegressionConvergenceResultRendererProps {
  converged: boolean;
}

export function RegressionConvergenceResultRenderer(
  props: RegressionConvergenceResultRendererProps,
) {
  const { converged } = props;
  const { colors } = useMantineTheme();
  return (
    <TaskControlsCard>
      <Group wrap="nowrap">
        {converged ? (
          <>
            <CheckCircle color={colors.green[6]} size={48} weight="fill" />
            <Text className="flex-1">
              The regression model has converged successfully; this means that
              the optimization algorithm was able to find best-fit parameters
              for the model. The coefficients can be relied on.
            </Text>
          </>
        ) : (
          <>
            <XCircle color={colors.red[6]} size={48} weight="fill" />
            <Text className="flex-1">
              The regression model wasn&apos;t able to converge successfully;
              this means that the optimization algorithm wasn&apos;t able to
              find best-fit parameters for the model. The coefficients
              shouldn&apos;t be relied on.
            </Text>
          </>
        )}
      </Group>
    </TaskControlsCard>
  );
}
