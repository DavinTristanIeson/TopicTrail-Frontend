import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestonDistributionConfigType } from '../../configuration/test-distribution';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack, useMantineTheme } from '@mantine/core';
import { VisualizationBinaryStatisticTestOnDistributionModel } from '@/api/correlation';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { max, zip } from 'lodash-es';
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from '@/modules/comparison/statistic-test/dictionary';
import PlotRenderer from '@/components/widgets/plotly';
import { ProjectContext } from '@/modules/project/context';

import { pickArrayByIndex } from '@/common/utils/iterable';
import {
  useVisualizationAlphaSlider,
  useBinaryStatisticTestVisualizationMethodSelect,
  useCategoriesAxisMultiSelect,
  BinaryStatisticTestVisualizationType,
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
  useVisualizationMinFrequencySlider,
} from '../configuration';

function VisualizationBinaryStatisticTestOnDistributionInternal(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnDistributionModel[],
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
) {
  const { item } = props;
  const { colors: mantineColors } = useMantineTheme();
  const data = props.data[0]!.data!;

  // region Configuration
  const { Component: AlphaSlider, filter: filterAlpha } =
    useVisualizationAlphaSlider();
  const { Component: VisualizationMethodSelect, type: vistype } =
    useBinaryStatisticTestVisualizationMethodSelect();

  const discriminators = React.useMemo(
    () => data.map((datum) => datum.discriminator),
    [data],
  );

  const project = React.useContext(ProjectContext);
  const column = project.config.data_schema.columns.find(
    (column) => column.name === item.column,
  );
  const { multiSelectProps: discriminatorSelectProps, indexed } =
    useCategoriesAxisMultiSelect({
      supportedCategories: discriminators,
      column: column,
    });

  const maxFrequency = React.useMemo(
    () => max(data.map((item) => item.yes_count)) ?? 0,
    [data],
  );
  const { Component: MinFrequencySlider, filter: filterFrequency } =
    useVisualizationMinFrequencySlider({ max: maxFrequency });

  // region Plot
  const values = React.useMemo(() => {
    const discriminatorIndices = indexed(discriminators);
    const process = function <T>(arr: T[]) {
      return pickArrayByIndex(arr, discriminatorIndices);
    };
    const x = process(discriminators);
    const effectSizes = process(data.map((datum) => datum.effect_size.value));
    const pValues = process(data.map((datum) => datum.significance.p_value));
    const confidences = process(
      data.map((datum) => (1 - datum.significance.p_value) * 100),
    );
    const statistics = process(
      data.map((datum) => datum.significance.statistic),
    );

    const invalidCounts = process(data.map((datum) => datum.invalid_count));
    const noCounts = process(data.map((datum) => datum.no_count));
    const yesCounts = process(data.map((datum) => datum.yes_count));

    const valid = zip(pValues, yesCounts).map(
      ([p, frequency]) => filterAlpha(p!) && filterFrequency(frequency!),
    );

    const { colors: baseColors } = generateColorsFromSequence(x);
    const plotColors = zip(baseColors, valid).map(([color, valid]) =>
      valid ? color : mantineColors.gray[2],
    );

    const statisticTestMethod =
      STATISTIC_TEST_METHOD_DICTIONARY[item.config.statistic_test_preference];
    const statisticTestMethodLabel =
      statisticTestMethod?.label ?? item.config.statistic_test_preference;
    const effectSizeMethod =
      EFFECT_SIZE_DICTIONARY[item.config.effect_size_preference];
    const effectSizeMethodLabel =
      effectSizeMethod?.label ?? item.config.effect_size_preference;
    const effectSizeMethodYAxis = {
      range: effectSizeMethod.range.every(Boolean)
        ? effectSizeMethod.range
        : undefined,
      minallowed: effectSizeMethod.range[0],
      maxallowed: effectSizeMethod.range[1],
    };

    const customdata = zip(
      pValues,
      confidences,
      statistics,
      effectSizes,
      yesCounts,
      noCounts,
    ) as any;
    const hovertemplate = [
      `<b>${item.column}</b>: %{x}`,
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>${statisticTestMethodLabel} Statistic</b>: %{customdata[2]}`,
      `<b>${effectSizeMethodLabel}</b>: %{customdata[3]}`,
      '<b>Positive Counts</b>: %{customdata[4]}',
      '<b>Negative Counts</b>: %{customdata[5]}',
    ];

    return {
      discriminators: x,
      effectSizes,
      pValues,
      confidences,
      statistics,
      valid,
      invalidCounts,
      noCounts,
      yesCounts,
      plotColors,
      customdata,
      hovertemplate,
      effectSizeMethodYAxis,
    };
  }, [
    data,
    discriminators,
    filterAlpha,
    filterFrequency,
    indexed,
    item,
    mantineColors.gray,
  ]);

  const frequenciesPlot = React.useMemo<PlotParams>(() => {
    const { discriminators, yesCounts, noCounts, invalidCounts } = values;
    return {
      data: [
        {
          name: 'Positive Rows',
          x: discriminators,
          y: yesCounts,
          type: 'bar',
          hovertemplate: `<b>Row contains %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.green[6],
          },
        },
        {
          name: 'Negative Rows',
          x: discriminators,
          y: noCounts,
          type: 'bar',
          hovertemplate: `<b>Row doesn't contain %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.red[6],
          },
        },
        {
          name: 'Invalid Rows',
          x: discriminators,
          y: invalidCounts,
          type: 'bar',
          hovertemplate: `<b>Invalid rows for %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.gray[6],
          },
        },
      ],
      layout: {
        title: `Frequencies of ${item.column}`,
        barmode: 'stack',
        yaxis: {
          minallowed: 0,
        },
      },
    };
  }, [
    item.column,
    mantineColors.gray,
    mantineColors.green,
    mantineColors.red,
    values,
  ]);

  const effectSizesPlot = React.useMemo<PlotParams>(() => {
    const {
      discriminators,
      effectSizes,
      customdata,
      plotColors,
      hovertemplate,
      effectSizeMethodYAxis,
    } = values;

    return {
      data: [
        {
          type: 'bar',
          x: discriminators,
          y: effectSizes,
          customdata,
          hovertemplate: hovertemplate.join('<br>'),
          marker: {
            color: plotColors,
          },
        },
      ],
      layout: {
        title: `Effect Sizes of How ${item.column} Affects ${item.config.target}`,
        yaxis: {
          ...effectSizeMethodYAxis,
        },
      },
    };
  }, [item, values]);

  const confidenceLevelsPlot = React.useMemo<PlotParams>(() => {
    const {
      discriminators,
      confidences,
      customdata,
      hovertemplate,
      plotColors,
    } = values;

    return {
      data: [
        {
          type: 'bar',
          x: discriminators,
          y: confidences,
          customdata,
          hovertemplate: hovertemplate.join('<br>'),
          marker: {
            color: plotColors,
          },
        },
      ],
      layout: {
        title: `Confidence Level of How ${item.column} Affects ${item.config.target}`,
        yaxis: {
          range: [0, 100],
          minallowed: 0,
          ticksuffix: '%',
        },
      },
    };
  }, [item, values]);

  let usedPlot: PlotParams;
  if (vistype === BinaryStatisticTestVisualizationType.Frequencies) {
    usedPlot = frequenciesPlot;
  } else if (vistype === BinaryStatisticTestVisualizationType.ConfidenceLevel) {
    usedPlot = confidenceLevelsPlot;
  } else {
    usedPlot = effectSizesPlot;
  }
  return (
    <Stack>
      <PlotInlineConfiguration>
        <MultiSelect
          {...discriminatorSelectProps}
          label={`Values of ${item.column}`}
        />
        {VisualizationMethodSelect}
        {AlphaSlider}
        {MinFrequencySlider}
      </PlotInlineConfiguration>
      <PlotRenderer plot={usedPlot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}

export default function VisualizationBinaryStatisticTestOnDistributionComponent(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnDistributionModel[],
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
) {
  const data = props.data[0]?.data;
  const item = props.item;
  if (!data || data.length === 0) {
    throw new Error(
      `It seems that ${item.column} doesn't contain any categories at all in the dataset so we cannot use them as binary variables.`,
    );
  }
  return <VisualizationBinaryStatisticTestOnDistributionInternal {...props} />;
}
