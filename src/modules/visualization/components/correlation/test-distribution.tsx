import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestConfigType } from '../../configuration/binary-statistic-test';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { Input, Select, Slider, Stack, useMantineTheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { VisualizationBinaryStatisticTestOnDistributionModel } from '@/api/correlation';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { zip } from 'lodash-es';
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from '@/modules/comparison/statistic-test/dictionary';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import PlotRenderer from '@/components/widgets/plotly';

function useVisualizationAlphaSlider() {
  const [alpha, setAlpha] = React.useState(0);
  const Component = (
    <Input.Wrapper
      label="Alpha"
      description="The p-value for the results of a statistic test to be considered significant."
    >
      <Slider
        value={alpha}
        min={0}
        max={1}
        step={0.01}
        onChange={setAlpha}
        label={`Alpha: ${alpha} | Confidence Level: ${100 - alpha * 100}`}
      />
    </Input.Wrapper>
  );

  const [debouncedAlpha] = useDebouncedValue(alpha, 1000, { leading: false });

  return { Component, alpha: debouncedAlpha };
}

enum VisualizationType {
  RowCounts = 'row-counts',
  ConfidenceLevel = 'significance',
  EffectSize = 'effect-sizes',
}

const VISUALIZATION_TYPE_DICTIONARY = {
  [VisualizationType.RowCounts]: {
    label: 'Row Counts',
    value: VisualizationType.RowCounts,
    description:
      'Show the proportion of rows that contains category A and rows that do not contain category A.',
  },
  [VisualizationType.ConfidenceLevel]: {
    label: 'Confidence Levels',
    value: VisualizationType.ConfidenceLevel,
    description:
      'Show the confidence levels of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
  [VisualizationType.EffectSize]: {
    label: 'Effect Sizes',
    value: VisualizationType.EffectSize,
    description:
      'Show the effect sizes of the statistic tests, wherein the category/discriminator is used to split the dataset into two subdatasets that are compared against each other.',
  },
};

export function useVisualizationMethodSelect() {
  const [type, setType] = React.useState(VisualizationType.EffectSize);

  const renderOption = useDescriptionBasedRenderOption(
    VISUALIZATION_TYPE_DICTIONARY,
  );

  const Component = (
    <Select
      value={type}
      onChange={setType as any}
      label="Data to Visualize"
      renderOption={renderOption}
    />
  );

  return { Component, type };
}

function VisualizationBinaryStatisticTestOnDistributionInternal(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnDistributionModel[],
    VisualizationBinaryStatisticTestConfigType
  >,
) {
  const { item } = props;
  const { colors: mantineColors } = useMantineTheme();
  const data = props.data[0]!.data!;

  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationMethodSelect, type: vistype } =
    useVisualizationMethodSelect();

  const values = React.useMemo(() => {
    const discriminators = data.map((datum) => datum.discriminator);
    const effectSizes = data.map((datum) => datum.effect_size.value);
    const pValues = data.map((datum) => datum.significance.p_value);
    const confidences = data.map(
      (datum) => (1 - datum.significance.p_value) * 100,
    );
    const statistics = data.map((datum) => datum.significance.statistic);
    const valid = pValues.map((p) => p < alpha);

    const invalidCounts = data.map((datum) => datum.invalid_count);
    const noCounts = data.map((datum) => datum.no_count);
    const yesCounts = data.map((datum) => datum.yes_count);

    const { colors: baseColors } = generateColorsFromSequence(discriminators);
    const plotColors = zip(baseColors, valid).map(([color, valid]) =>
      valid ? color : mantineColors.gray[2],
    );

    const statisticTestMethodLabel =
      STATISTIC_TEST_METHOD_DICTIONARY[item.config.statistic_test_preference]
        ?.label ?? item.config.statistic_test_preference;
    const effectSizeMethodLabel =
      EFFECT_SIZE_DICTIONARY[item.config.effect_size_preference]?.label ??
      item.config.effect_size_preference;

    const customdata = [
      pValues,
      confidences,
      statistics,
      effectSizes,
      yesCounts,
      noCounts,
    ];
    const hovertemplate = [
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>${statisticTestMethodLabel} Statistic</b>: %{customdata[2]}`,
      `<b>${effectSizeMethodLabel}</b>: %{customdata[3]}`,
      '<b>Positive Counts</b>: %{customdata[4]}',
      '<b>Negative Counts</b>: %{customdata[5]}',
    ];

    return {
      discriminators,
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
    };
  }, [alpha, data, item, mantineColors.gray]);

  const rowCountsPlot = React.useMemo<PlotParams>(() => {
    const { discriminators, yesCounts, noCounts, invalidCounts } = values;
    return {
      data: [
        {
          name: 'Positive Rows',
          x: discriminators,
          y: yesCounts,
          hovertemplate: `<b>Row contains %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.green[6],
          },
        },
        {
          name: 'Negative Rows',
          x: discriminators,
          y: noCounts,
          hovertemplate: `<b>Row doesn't contain %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.red[6],
          },
        },
        {
          name: 'Invalid Rows',
          x: discriminators,
          y: invalidCounts,
          hovertemplate: `<b>Invalid rows for %{x}</b><br><b>Frequency</b>: %{y}`,
          marker: {
            color: mantineColors.gray[6],
          },
        },
      ],
      layout: {
        title: `Row Counts of ${item.column}`,
        barmode: 'stack',
        xaxis: {
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
      hovertemplate,
      plotColors,
    } = values;

    const plotHoverTemplate = hovertemplate.slice();
    const newTemplate = plotHoverTemplate.splice(3, 1);
    if (newTemplate.length > 0) {
      plotHoverTemplate.unshift('-'.repeat(15));
      plotHoverTemplate.unshift(newTemplate[0]!);
    }

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
        title: `Effect Sizes of How ${item.column} Discriminates ${item.config.target}`,
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

    const plotHoverTemplate = hovertemplate.slice();
    const newTemplate = plotHoverTemplate.splice(1, 1);
    if (newTemplate.length > 0) {
      plotHoverTemplate.unshift('-'.repeat(15));
      plotHoverTemplate.unshift(newTemplate[0]!);
    }

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
        title: `Confidence Level of How ${item.column} Discriminates ${item.config.target}`,
        xaxis: {
          range: [0, 100],
          minallowed: 0,
          ticksuffix: '%',
        },
      },
    };
  }, [item, values]);

  let usedPlot: PlotParams;
  if (vistype === VisualizationType.RowCounts) {
    usedPlot = rowCountsPlot;
  } else if (vistype === VisualizationType.ConfidenceLevel) {
    usedPlot = confidenceLevelsPlot;
  } else {
    usedPlot = effectSizesPlot;
  }
  return (
    <Stack>
      {VisualizationMethodSelect}
      {vistype !== VisualizationType.RowCounts && AlphaSlider}
      <PlotRenderer plot={usedPlot} />
    </Stack>
  );
}

export default function VisualizationBinaryStatisticTestOnDistributionComponent(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnDistributionModel[],
    VisualizationBinaryStatisticTestConfigType
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
