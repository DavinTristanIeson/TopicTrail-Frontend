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
import { fromPairs, merge, unzip, zip } from 'lodash-es';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  UltimateRegressionCoefficientModel,
  RegressionCoefficientsVisualizationTypeEnum,
} from './types';
import { RegressionVisualizationData } from './data';
import { CheckCircle, Info, PlusMinus, XCircle } from '@phosphor-icons/react';
import { TaskControlsCard } from '@/modules/task/controls';
import { useDisclosure } from '@mantine/hooks';
import { formatConfidenceInterval, pValueToConfidenceLevel } from './utils';
import PlotRenderer from '@/components/widgets/plotly';
import { formatNumber } from '@/common/utils/number';
import { NamedData } from '@/modules/visualization/types/base';
import { useVisualizationSubdatasetsMultiSelect } from '@/modules/visualization/components/configuration/subdatasets';
import { pickArrayById } from '@/common/utils/iterable';

interface UseAlphaConstrainedColorsProps {
  alpha: number;
}

export function useRegressionAlphaConstrainedColors(
  props: UseAlphaConstrainedColorsProps,
) {
  const { alpha } = props;
  const { colors: mantineColors } = useMantineTheme();
  return React.useCallback(
    (facets: NamedData<UltimateRegressionCoefficientModel[]>[]) => {
      const { colorMap } = generateColorsFromSequence(
        facets.map((facet) => facet.name),
      );
      return fromPairs(
        facets.map((facet) => {
          const coefficients = facet.data;
          const baseColor = colorMap.get(facet.name);
          const colors = coefficients.map((coefficient) => {
            if (coefficient!.p_value < alpha) {
              return baseColor;
            }
            return mantineColors.gray[3];
          });
          return [facet.name, colors];
        }),
      );
    },
    [alpha, mantineColors.gray],
  );
}

interface UseRegressionChosenCoefficientsProps {
  coefficients: UltimateRegressionCoefficientModel[];
}

export function useRegressionCoefficientMultiSelect(
  props: UseRegressionChosenCoefficientsProps,
) {
  const { coefficients } = props;
  const namedData = React.useMemo(() => {
    return coefficients.map((coefficient) => {
      return {
        name: coefficient.name,
        data: coefficient,
      };
    });
  }, [coefficients]);
  const { viewedData, viewed, Component } =
    useVisualizationSubdatasetsMultiSelect({
      data: namedData,
      limit: null,
      selectProps: {
        label: 'Independent Variables',
        description: 'Choose the independent variables to visualize.',
      },
    });
  const select = React.useCallback(
    (coefficients: UltimateRegressionCoefficientModel[]) => {
      return pickArrayById(coefficients, viewed, (coef) => coef.name);
    },
    [viewed],
  );
  return {
    Component,
    coefficients: React.useMemo(() => {
      return viewedData.map((coefficient) => coefficient.data);
    }, [viewedData]),
    select,
  };
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
  data: NamedData<RegressionVisualizationData>[];
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

    const { colorMap } = generateColorsFromSequence(
      data.map((facet) => facet.name),
    );
    const traces = data.map((data) => {
      const {
        name,
        data: { variables: x, confidenceLevels: y, customdata, hovertemplate },
      } = data;
      return {
        name,
        x,
        y,
        type: 'bar',
        marker: {
          color: colorMap.get(name),
        },
        customdata,
        hovertemplate,
      } as PlotParams['data'][number];
    });

    const confidence = pValueToConfidenceLevel(alpha);

    return {
      data: traces,
      layout: merge(
        {
          title: 'Confidence Level of Each Coefficient',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
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
              text: `Alpha: ${formatNumber(alpha)}<br>Confidence Level: ${formatNumber(confidence)}%`,
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
  const generateColors = useRegressionAlphaConstrainedColors({
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionCoefficientsVisualizationTypeEnum.OddsRatio) {
      return null;
    }
    const colorMap = generateColors(
      data.map((x) => {
        return {
          name: x.name,
          data: x.data.coefficients,
        };
      }),
    );
    const traces = data.map((data) => {
      const {
        name,
        data: {
          variables: x,
          oddsRatioConfidenceIntervals,
          oddsRatios,
          customdata,
          hovertemplate,
        },
      } = data;

      const y = oddsRatios!.map((ratio) => ratio - 1);
      const error_y = getConfidenceIntervalOffsets(
        oddsRatios!,
        oddsRatioConfidenceIntervals!,
      );
      return {
        name,
        x,
        y,
        type: 'bar',
        base: 1,
        customdata,
        hovertemplate,
        error_y,
        marker: {
          color: colorMap[name],
        },
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: merge(
        {
          title: 'Odds Ratio of Each Coefficient',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
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
  }, [data, generateColors, layout, type]);
  return plot;
}

export function useCoefficientRegressionResultPlot(
  props: CommonRegressionResultPlotProps,
) {
  const { type, alpha, data, layout } = props;
  const generateColors = useRegressionAlphaConstrainedColors({
    alpha,
  });
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionCoefficientsVisualizationTypeEnum.Coefficient) {
      return null;
    }
    const colorMap = generateColors(
      data.map((x) => {
        return {
          name: x.name,
          data: x.data.coefficients,
        };
      }),
    );
    const traces = data.map((data) => {
      const {
        name,
        data: {
          variables: x,
          values: y,
          confidenceIntervals,
          customdata,
          hovertemplate,
        },
      } = data;

      const error_y = getConfidenceIntervalOffsets(y, confidenceIntervals!);
      return {
        name,
        x,
        y,
        type: 'bar',
        customdata,
        hovertemplate,
        error_y,
        marker: {
          color: colorMap[name],
        },
      } as PlotParams['data'][number];
    });

    return {
      data: traces,
      layout: merge(
        {
          title: 'Coefficients',
          xaxis: {
            title: 'Independent Variables (Subdatasets)',
            type: 'category',
          },
          yaxis: {
            title: 'Coefficient Value',
          },
        },
        layout,
      ),
    } as PlotParams;
  }, [data, generateColors, layout, type]);
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
          text: `Baseline: ${formatNumber(baseline)}` + (percentage ? '%' : ''),
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
  const oddsRatioConfidenceInterval = (
    intercept as LogisticRegressionCoefficientModel
  ).odds_ratio_confidence_interval;
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
      value: formatNumber(intercept.statistic),
    },
    {
      label: 'P-Value',
      value: formatNumber(intercept.p_value),
    },
    {
      label: 'Confidence Level',
      value: `${formatNumber(pValueToConfidenceLevel(intercept.p_value))}%`,
    },
    {
      label: 'Confidence Interval (Alpha = 0.05)',
      value: `${formatNumber(intercept.confidence_interval[0])} - ${formatNumber(intercept.confidence_interval[1])}`,
    },
  ];

  const [opened, { toggle, close: onClose }] = useDisclosure();
  const { colors: mantineColors } = useMantineTheme();
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
          <Group>
            <PlusMinus size={14} color={mantineColors.brand[6]} />
            <Text size="md" fw={500} c="brand" style={{ fontSize: 36 }}>
              {formatConfidenceInterval(
                withOdds
                  ? oddsRatioConfidenceInterval
                  : intercept.confidence_interval,
              )}
            </Text>
          </Group>
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
              shouldn&apos;t be relied on. This may happen because of complete
              or quasi-complete separation; consider dropping or merging
              independent variables with ridiculously high standard errors as
              they are the prime suspects for the separation.
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
  title?: string;
}

export function PredictedProbabilityDistributionPlot(
  props: PredictedProbabilityDistributionPlotProps,
) {
  const { dependentVariableLevels, probabilities, title } = props;
  const plot = React.useMemo<PlotParams>(() => {
    return {
      data: [
        {
          x: dependentVariableLevels,
          y: probabilities.map((probability) => probability * 100),
          type: 'bar',
          hovertemplate: [
            'Dependent Variable Level: %{x}',
            'Probability: %{y:.3f}%',
          ].join('<br>'),
        },
      ],
      layout: {
        title: title ?? 'Predicted Probability Distribution',
        xaxis: {
          title: 'Levels',
          type: 'category',
        },
        yaxis: {
          title: 'Probability',
          minallowed: 0,
          maxallowed: 100,
          range: [0, 100],
          ticksuffix: '%',
        },
      },
    } as PlotParams;
  }, [dependentVariableLevels, probabilities, title]);
  return <PlotRenderer plot={plot} />;
}
