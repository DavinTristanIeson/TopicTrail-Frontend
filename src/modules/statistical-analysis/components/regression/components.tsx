import { LogisticRegressionCoefficientModel } from '@/api/statistical-analysis';
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
import { merge, unzip, zip } from 'lodash-es';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  UltimateRegressionCoefficientModel,
  RegressionCoefficientsVisualizationTypeEnum,
} from './types';
import { RegressionVisualizationData } from './data';
import { CheckCircle, Info, XCircle } from '@phosphor-icons/react';
import { TaskControlsCard } from '@/modules/task/controls';
import { useDisclosure } from '@mantine/hooks';
import { pValueToConfidenceLevel } from './utils';
import PlotRenderer from '@/components/widgets/plotly';

interface UseAlphaConstrainedColorsProps {
  coefficients: UltimateRegressionCoefficientModel[];
  alpha: number;
}

export function useRegressionAlphaConstrainedColors(
  props: UseAlphaConstrainedColorsProps,
) {
  const { coefficients, alpha } = props;
  const { colors: mantineColors } = useMantineTheme();
  return React.useMemo(() => {
    const { colors: generatedColors } = generateColorsFromSequence(
      coefficients.map((coefficient) => coefficient.name),
    );
    const colors = zip(generatedColors, coefficients).map(
      ([color, coefficient]) => {
        if (coefficient!.p_value < alpha) {
          return color!;
        }
        return mantineColors.gray[6];
      },
    );
    return colors;
  }, [alpha, coefficients, mantineColors.gray]);
}

function getConfidenceIntervalOffsets(
  coefficients: number[],
  coefficientIntervals: [number, number][],
) {
  const [confidenceIntervalMinus, confidenceIntervalPlus] = unzip(
    zip(coefficients, coefficientIntervals).map(([coefficient, interval]) => {
      if (interval![0] == null || interval![1] == null) {
        return [undefined, undefined];
      }
      return [
        // value - lower
        coefficient! - interval![0],
        // upper - value
        interval![1] - coefficient!,
      ];
    }),
  );
  return {
    type: 'data',
    symmetric: false,
    array: confidenceIntervalPlus,
    arrayminus: confidenceIntervalMinus,
    visible: true,
  };
}

interface CommonRegressionResultPlotProps {
  type: RegressionCoefficientsVisualizationTypeEnum;
  alpha: number;
  data: RegressionVisualizationData;
  layout?: PlotParams['layout'];
}

export function useConfidenceLevelRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const { colors: mantineColors } = useMantineTheme();
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionCoefficientsVisualizationTypeEnum.ConfidenceLevel) {
      return null;
    }
    const {
      variables: x,
      confidenceLevels: y,
      customdata,
      hovertemplate,
      xaxisTitle,
    } = data;

    const confidence = pValueToConfidenceLevel(alpha);

    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(x).colors,
          },
          customdata,
          hovertemplate,
        },
      ],
      layout: merge(
        {
          title: 'Confidence Level of Each Coefficient',
          xaxis: {
            title: xaxisTitle,
          },
          yaxis: {
            title: 'Confidence Level (%)',
            minallowed: 0,
            maxallowed: 100,
          },
          annotations: [
            {
              x: 0.1,
              xref: 'paper',
              y: confidence,
              yref: 'y',
              text: `Alpha: ${alpha.toFixed(2)}<br>Confidence Level: ${confidence.toFixed()}%`,
            },
          ],
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              yref: 'y',
              x0: 0,
              x1: 1,
              y0: confidence,
              y1: confidence,
              line: {
                color: mantineColors.brand[6],
                width: 3,
                dash: 'dash',
              },
            },
          ],
        },
        layout,
      ),
    } as PlotParams;
  }, [alpha, data, layout, mantineColors.brand, type]);
  return plot;
}

export function useOddsRatioRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const colors = useRegressionAlphaConstrainedColors({
    coefficients: data.coefficients,
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionCoefficientsVisualizationTypeEnum.OddsRatio) {
      return null;
    }
    const {
      variables: x,
      oddsRatioConfidenceIntervals,
      oddsRatios,
      customdata,
      hovertemplate,
      xaxisTitle,
    } = data;

    const y = oddsRatios!.map((ratio) => ratio - 1);
    const error_y = getConfidenceIntervalOffsets(
      oddsRatios!,
      oddsRatioConfidenceIntervals!,
    );

    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          base: 1,
          customdata,
          hovertemplate,
          error_y,
          marker: {
            color: colors,
          },
        } as PlotParams['data'][number],
      ],
      layout: merge(
        {
          title: 'Odds Ratio of Each Coefficient',
          xaxis: {
            title: xaxisTitle,
          },
          yaxis: {
            title: 'Odds Ratio (Log-Scaled)',
            type: 'log',
            minallowed: -1,
          },
          shapes: [
            {
              type: 'line',
              xref: 'paper',
              yref: 'y',
              x0: 0,
              x1: 1,
              y0: 1,
              y1: 1,
              line: {
                color: 'black',
                width: 2,
              },
            },
          ],
        },
        layout,
      ),
    } as PlotParams;
  }, [colors, data, layout, type]);
  return plot;
}

export function useCoefficientRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const colors = useRegressionAlphaConstrainedColors({
    coefficients: data.coefficients,
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionCoefficientsVisualizationTypeEnum.Coefficient) {
      return null;
    }
    const {
      variables: x,
      values: y,
      confidenceIntervals,
      customdata,
      hovertemplate,
      xaxisTitle,
    } = data;

    const error_y = getConfidenceIntervalOffsets(y, confidenceIntervals!);

    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          customdata,
          hovertemplate,
          error_y,
          marker: {
            color: colors,
          },
        },
      ],
      layout: merge(
        {
          title: 'Coefficients',
          xaxis: {
            title: xaxisTitle,
          },
          yaxis: {
            title: 'Coefficient Value',
          },
        },
        layout,
      ),
    } as PlotParams;
  }, [colors, data, layout, type]);
  return plot;
}

interface UsePredictedResultsBaselineLineProps {
  baseline: number;
  percentage?: boolean;
}

export function usePredictedResultsBaselineLine(
  props: UsePredictedResultsBaselineLineProps,
) {
  const { baseline, percentage } = props;
  const { colors: mantineColors } = useMantineTheme();
  return React.useMemo<PlotParams['layout']>(() => {
    return {
      annotations: [
        {
          x: 0.1,
          xref: 'paper',
          y: baseline,
          yref: 'y',
          text: `Baseline: ${baseline.toFixed(3)}` + (percentage ? '%' : ''),
        },
      ],
      shapes: [
        {
          type: 'line',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: baseline,
          y1: baseline,
          line: {
            color: mantineColors.brand[6],
            width: 3,
            dash: 'dash',
          },
        },
      ],
    };
  }, [baseline, mantineColors.brand, percentage]);
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

interface PredictedProbabilityDistributionPlotProps {
  dependentVariableLevels: string[];
  probabilities: number[];
}

export function PredictedProbabilityDistributionPlot(
  props: PredictedProbabilityDistributionPlotProps,
) {
  const { dependentVariableLevels, probabilities } = props;
  const plot = React.useMemo<PlotParams>(() => {
    return {
      data: [
        {
          x: dependentVariableLevels,
          y: probabilities.map((probability) => probability * 100),
        },
      ],
      layout: {
        title: 'Predicted Probability Distribution',
        xaxis: {
          title: 'Levels',
        },
        yaxis: {
          title: 'Probability',
          minallowed: 0,
          maxallowed: 100,
          ticksuffix: '%',
        },
      },
    };
  }, [dependentVariableLevels, probabilities]);
  return <PlotRenderer plot={plot} />;
}
