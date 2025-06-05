import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack, useMantineTheme } from '@mantine/core';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { max, zip } from 'lodash-es';
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from '@/modules/statistical-analysis/dictionary';
import PlotRenderer from '@/components/widgets/plotly';
import { ProjectContext } from '@/modules/project/context';

import { pickArrayByIndex } from '@/common/utils/iterable';

import { findProjectColumn } from '@/api/project';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { BinaryStatisticTestOnDistributionResultModel } from '@/api/statistical-analysis';
import {
  PlotInlineConfiguration,
  useCategoriesAxisMultiSelect,
} from '@/modules/visualization/components/configuration';
import { plotlyWrapText } from '@/modules/visualization/components/utils';
import {
  BinaryStatisticTestVisualizationType,
  useBinaryStatisticTestVisualizationMethodSelect,
} from './common';
import { BinaryStatisticTestConfig } from '../../configuration/binary-statistic-test';
import {
  useVisualizationAlphaSlider,
  useVisualizationMinFrequencySlider,
} from '../plot-config';

export default function BinaryStatisticTestOnDistributionResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    BinaryStatisticTestOnDistributionResultModel,
    BinaryStatisticTestConfig
  >,
) {
  const { data, config } = props;
  const { colors: mantineColors } = useMantineTheme();

  // region Configuration
  const { Component: AlphaSlider, filter: filterAlpha } =
    useVisualizationAlphaSlider({});
  const { Component: VisualizationMethodSelect, type: vistype } =
    useBinaryStatisticTestVisualizationMethodSelect();

  const project = React.useContext(ProjectContext);
  const column = findProjectColumn(project, config.column);
  const discriminators = data.groups;
  const { multiSelectProps: discriminatorSelectProps, indexed } =
    useCategoriesAxisMultiSelect({
      supportedCategories: discriminators,
      column: column,
    });

  const maxFrequency = React.useMemo(
    () =>
      max(data.results.map((item) => item.groups[0]?.valid_count ?? 0)) ?? 0,
    [data.results],
  );
  const { Component: MinFrequencySlider, filter: filterFrequency } =
    useVisualizationMinFrequencySlider({ max: maxFrequency });

  // region Plot
  const values = React.useMemo(() => {
    const results = data.results;
    const discriminatorIndices = indexed(discriminators);
    const process = function <T>(arr: T[]) {
      return pickArrayByIndex(arr, discriminatorIndices);
    };
    const x = process(discriminators);
    const effectSizes = process(
      results.map((result) => result.effect_size.value),
    );
    const pValues = process(
      results.map((result) => result.significance.p_value),
    );
    const confidences = process(
      results.map((result) => (1 - result.significance.p_value) * 100),
    );
    const statistics = process(
      results.map((result) => result.significance.statistic),
    );

    const invalidCounts = process(
      results.map((result) => {
        return (
          (result.groups[0]?.empty_count ?? 0) +
          (result.groups[1]?.empty_count ?? 0)
        );
      }),
    );
    const noCounts = process(
      results.map((result) => result.groups[1]?.valid_count ?? 0),
    );
    const yesCounts = process(
      results.map((result) => result.groups[0]?.valid_count ?? 0),
    );
    const warnings = process(
      results.map((result) => {
        if (result.warnings.length === 0) {
          return 'None';
        }
        return result.warnings
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
      STATISTIC_TEST_METHOD_DICTIONARY[config.statistic_test_preference];
    const statisticTestMethodLabel =
      statisticTestMethod?.label ?? config.statistic_test_preference;
    const effectSizeMethod =
      EFFECT_SIZE_DICTIONARY[config.effect_size_preference];
    const effectSizeMethodLabel =
      effectSizeMethod?.label ?? config.effect_size_preference;
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
      `<b>Subdataset</b>: %{x}`,
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
    data.results,
    indexed,
    discriminators,
    config.statistic_test_preference,
    config.effect_size_preference,
    filterAlpha,
    filterFrequency,
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
        title: `Frequencies of Each Subdataset`,
        barmode: 'stack',
        yaxis: {
          minallowed: 0,
          title: 'Frequency',
        },
        xaxis: {
          title: 'Subdatasets',
          type: 'category',
        },
      },
    } as PlotParams;
  }, [mantineColors.gray, mantineColors.green, mantineColors.red, values]);

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
        title: `Effect Sizes of How Subdatasets Affects ${config.column}`,
        yaxis: {
          ...effectSizeMethodYAxis,
          title: 'Effect Size',
        },
        xaxis: {
          title: 'Subdatasets',
          type: 'category',
        },
      },
    } as PlotParams;
  }, [config.column, values]);

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
        title: `Confidence Level of How Subdatasets Affects ${config.column}`,
        yaxis: {
          range: [0, 100],
          minallowed: 0,
          ticksuffix: '%',
          title: 'Confidence Level',
        },
        xaxis: {
          title: 'Subdatasets',
          type: 'category',
        },
      },
    } as PlotParams;
  }, [config.column, values]);

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
          label={`Values of ${config.column}`}
        />
        {VisualizationMethodSelect}
        {AlphaSlider}
        {MinFrequencySlider}
      </PlotInlineConfiguration>
      <PlotRenderer plot={usedPlot} />
    </Stack>
  );
}
