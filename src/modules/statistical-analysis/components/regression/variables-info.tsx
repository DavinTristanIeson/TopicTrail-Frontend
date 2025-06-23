import {
  RegressionDependentVariableLevelInfo,
  RegressionIndependentVariableInfo,
} from '@/api/statistical-analysis';
import {
  REGRESSION_VARIABLE_INFO_VISUALIZATION_TYPE_DICTIONARY,
  RegressionVariableInfoVisualizationType,
  useRegressionVisualizationTypeSelect,
} from './types';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { Skeleton, Stack, Switch, useMantineTheme } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';
import { useStatisticTestSubdatasetCooccurrenceDataProvider } from '../../data-provider/contingency-table';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';
import SubdatasetCooccurrenceResultRenderer from '../others/subdataset-cooccurrence';
import { sum } from 'lodash-es';
import { useDisclosure } from '@mantine/hooks';
import { RegressionInterpretation } from '@/common/constants/enum';

interface UseRegressionStatisticPlotProps {
  independentVariables: RegressionIndependentVariableInfo[];
  observationCount: number;
  type: RegressionVariableInfoVisualizationType;
  interpretation: RegressionInterpretation;
}

export function useSampleSizeRegressionResultPlot(
  props: UseRegressionStatisticPlotProps,
) {
  const { independentVariables, observationCount, interpretation, type } =
    props;
  const [includeBaseline, { toggle: toggleIncludeBaseline }] =
    useDisclosure(false);

  const { colors: mantineColors } = useMantineTheme();
  const plot = React.useMemo<PlotParams | null>(() => {
    if (type !== RegressionVariableInfoVisualizationType.SampleSize) {
      return null;
    }
    const x = independentVariables.map((coefficient) => coefficient.name);
    const y = independentVariables.map(
      (coefficient) => coefficient.sample_size,
    );
    const { colors } = generateColorsFromSequence(x);
    if (includeBaseline) {
      x.push('Baseline');
      y.push(observationCount - sum(y)!);
      colors.push(mantineColors.gray[3]);
    }
    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          marker: {
            color: colors,
          },
          hovertemplate: [
            '<b>Variable</b>: %{x}',
            '<b>Sample Size</b>: %{y}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: 'Sample Sizes of Each Independent Variables',
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
        },
        yaxis: {
          title: 'Sample Size',
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [
    includeBaseline,
    independentVariables,
    mantineColors.gray,
    observationCount,
    type,
  ]);
  const BaselineSwitch =
    interpretation === RegressionInterpretation.RelativeToBaseline ? (
      <Switch
        label="Include baseline?"
        description="Should the number of observations used as the baseline be shown?"
        onClick={toggleIncludeBaseline}
      />
    ) : undefined;
  return { plot, BaselineSwitch };
}

interface UseVarianceInflationFactorRegressionResultPlotProps {
  type: RegressionVariableInfoVisualizationType;
  independentVariables: RegressionIndependentVariableInfo[];
}

export function useVarianceInflationFactorRegressionResultPlot(
  props: UseVarianceInflationFactorRegressionResultPlotProps,
) {
  const { type, independentVariables } = props;
  const mantineColors = useMantineTheme().colors;
  return React.useMemo<PlotParams | null>(() => {
    if (
      type !== RegressionVariableInfoVisualizationType.VarianceInflationFactor
    ) {
      return null;
    }

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
    const x = independentVariables.map((variable) => variable.name);
    const y = independentVariables.map(
      (variable) => variable.variance_inflation_factor,
    );
    const { colors } = generateColorsFromSequence(x);
    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          hovertemplate: [
            '<b>Independent Variable</b>: %{x}',
            '<b>Variance Inflation Factor</b>: %{y}',
          ].join('<br>'),
          marker: {
            color: colors,
          },
        },
      ],
      layout: {
        title: 'Variance Inflation Factors of Each Independent Variables',
        xaxis: {
          title: 'Independent Variables (Subdatasets)',
          type: 'category',
        },
        yaxis: {
          title: 'Variance Inflation Factor',
          minallowed: 0,
          range: [0, 6],
        },
        annotations: VIFlineAnnotations,
        shapes: VIFlineShapes,
      },
    } as PlotParams;
  }, [independentVariables, mantineColors.yellow, type]);
}

interface UseOrdinalRegressionSampleSizePlotProps {
  dependentVariableLevels?: RegressionDependentVariableLevelInfo[];
  type: RegressionVariableInfoVisualizationType;
}

function useDependentVariableLevelSampleSizePlot(
  props: UseOrdinalRegressionSampleSizePlotProps,
) {
  const { dependentVariableLevels, type } = props;
  const plot = React.useMemo<PlotParams | null>(() => {
    if (
      type !== RegressionVariableInfoVisualizationType.LevelSampleSize ||
      !dependentVariableLevels
    ) {
      return null;
    }
    const x = dependentVariableLevels.map((level) => level.name);
    const y = dependentVariableLevels.map((level) => level.sample_size);
    return {
      data: [
        {
          x,
          y,
          type: 'bar',
          marker: {
            color: generateColorsFromSequence(x).colors,
          },
          hovertemplate: [
            '<b>Level</b>: %{x}',
            '<b>Sample Size</b>: %{y}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: 'Sample Size of Each Dependent Variable Level',
        xaxis: {
          title: 'Dependent Variable Level',
          type: 'category',
        },
        yaxis: {
          title: 'Sample Size',
          minallowed: 0,
        },
      },
    } as PlotParams;
  }, [dependentVariableLevels, type]);
  return plot;
}

function RegressionIndependentVariablesCooccurrenceRenderer() {
  const { data, error, loading, refetch } =
    useStatisticTestSubdatasetCooccurrenceDataProvider({
      config: {},
      committed: true,
    });
  return (
    <FetchWrapperComponent
      error={error}
      isLoading={loading}
      onRetry={refetch}
      loadingComponent={<Skeleton h={300} />}
    >
      {data && <SubdatasetCooccurrenceResultRenderer config={{}} data={data} />}
    </FetchWrapperComponent>
  );
}

interface BaseRegressionVariablesInfoSection {
  independentVariables: RegressionIndependentVariableInfo[];
  dependentVariableLevels?: RegressionDependentVariableLevelInfo[];
  supportedTypes: RegressionVariableInfoVisualizationType[];
  interpretation: RegressionInterpretation;
  observationCount: number;
}

export default function BaseRegressionVariablesInfoSection(
  props: BaseRegressionVariablesInfoSection,
) {
  const {
    independentVariables,
    dependentVariableLevels,
    supportedTypes,
    interpretation,
    observationCount,
  } = props;
  const { type, Component: SelectType } = useRegressionVisualizationTypeSelect({
    dictionary: REGRESSION_VARIABLE_INFO_VISUALIZATION_TYPE_DICTIONARY,
    supportedTypes,
  });
  const vifPlot = useVarianceInflationFactorRegressionResultPlot({
    independentVariables,
    type,
  });
  const { plot: sampleSizePlot, BaselineSwitch } =
    useSampleSizeRegressionResultPlot({
      independentVariables,
      type,
      interpretation,
      observationCount,
    });
  const dependentVariablesPlot = useDependentVariableLevelSampleSizePlot({
    dependentVariableLevels: dependentVariableLevels,
    type,
  });

  const usedPlot = vifPlot ?? sampleSizePlot ?? dependentVariablesPlot;

  if (
    type ===
    RegressionVariableInfoVisualizationType.IndependentVariableCooccurrence
  ) {
    return (
      <Stack>
        {SelectType}
        <RegressionIndependentVariablesCooccurrenceRenderer />
      </Stack>
    );
  }

  return (
    <Stack>
      {SelectType}
      {BaselineSwitch}
      {usedPlot && <PlotRenderer plot={usedPlot} />}
    </Stack>
  );
}
