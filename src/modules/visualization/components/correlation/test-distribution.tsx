import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestonDistributionConfigType } from '../../configuration/test-distribution';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack, useMantineTheme } from '@mantine/core';
import { VisualizationBinaryStatisticTestOnDistributionMainModel } from '@/api/correlation';
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
  VisualizationCorrelationStatisticTestResultsRenderer,
} from '../configuration';
import { findProjectColumn } from '@/api/project';
import { plotlyWrapText } from '../utils';

export default function VisualizationBinaryStatisticTestOnDistribution(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnDistributionMainModel,
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
) {
  const { item } = props;
  const { colors: mantineColors } = useMantineTheme();
  const mainData = props.data[0]!.data!;

  // region Configuration
  const { Component: AlphaSlider, filter: filterAlpha } =
    useVisualizationAlphaSlider();
  const { Component: VisualizationMethodSelect, type: vistype } =
    useBinaryStatisticTestVisualizationMethodSelect();

  const project = React.useContext(ProjectContext);
  const column = findProjectColumn(project, item.column);
  const discriminators = mainData.discriminators;
  const { multiSelectProps: discriminatorSelectProps, indexed } =
    useCategoriesAxisMultiSelect({
      supportedCategories: discriminators,
      column: column,
    });

  const maxFrequency = React.useMemo(
    () => max(mainData.results.map((item) => item.yes_count)) ?? 0,
    [mainData.results],
  );
  const { Component: MinFrequencySlider, filter: filterFrequency } =
    useVisualizationMinFrequencySlider({ max: maxFrequency });

  // region Plot
  const values = React.useMemo(() => {
    const data = mainData.results;
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
    const warnings = process(
      data.map((datum) => {
        if (datum.warnings.length === 0) {
          return 'None';
        }
        return datum.warnings
          .map((warning) => plotlyWrapText(`- ${warning}`))
          .join('<br>');
      }),
    );

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

    const customdata = zip<string | number>(
      pValues,
      confidences,
      statistics,
      effectSizes,
      yesCounts,
      noCounts,
      warnings,
    ) as any;
    const hovertemplate = [
      `<b>${item.column}</b>: %{x}`,
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>${statisticTestMethodLabel} Statistic</b>: %{customdata[2]}`,
      `<b>${effectSizeMethodLabel}</b>: %{customdata[3]}`,
      '<b>Positive Counts</b>: %{customdata[4]}',
      '<b>Negative Counts</b>: %{customdata[5]}',
      '<br><b>Warnings</b>:<br>%{customdata[6]}',
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
    discriminators,
    filterAlpha,
    filterFrequency,
    indexed,
    item,
    mainData.results,
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
      <VisualizationCorrelationStatisticTestResultsRenderer
        column1={item.column}
        column2={item.config.target}
        effectSize={mainData.effect_size}
        significance={mainData.significance}
        warnings={mainData.warnings}
      />
      <PlotRenderer plot={usedPlot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}
