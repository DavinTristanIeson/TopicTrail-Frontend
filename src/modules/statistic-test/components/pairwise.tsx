import { PairwiseStatisticTestResultModel } from '@/api/statistic-test';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { MultiSelect, Select, Stack } from '@mantine/core';
import type { PlotParams } from 'react-plotly.js';
import { map2D, mask2D, zip2D } from '@/common/utils/iterable';
import { BaseStatisticTestResultRendererProps } from '../types';
import { ContingencyTableConfig } from '../configuration/contingency-table';
import {
  PlotInlineConfiguration,
  StatisticTestEmptyPlotWarning,
  useCategoriesAxisMultiSelect,
  useVisualizationAlphaSlider,
} from '@/modules/visualization/components/configuration';
import { getBalancedHeatmapZRange } from '@/modules/visualization/components/configuration/heatmap';

enum PairwiseStatisticTestVisualizationMethod {
  Confidence = 'confidence',
  EffectSize = 'effect_size',
}

const PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY = {
  [PairwiseStatisticTestVisualizationMethod.Confidence]: {
    label: 'Error-Corrected Confidence Level',
    value: PairwiseStatisticTestVisualizationMethod.Confidence,
    description:
      'Show the confidence level that there is a statistically significant difference between each pair of groups.',
    hoverLabel: 'Confidence',
    colorscale: 'Viridis',
  },
  [PairwiseStatisticTestVisualizationMethod.EffectSize]: {
    label: 'Effect Size',
    value: PairwiseStatisticTestVisualizationMethod.EffectSize,
    description: 'Show the effect size between each pair of groups.',
    hoverLabel: 'Effect Size',
    colorscale: 'RdBu',
  },
};
const PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_OPTIONS = Object.values(
  PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY,
);

export function PairwiseStatisticTestResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    PairwiseStatisticTestResultModel,
    ContingencyTableConfig
  >,
) {
  const { data, config } = props;

  // region Configuration
  const [method, setMethod] = React.useState(
    PairwiseStatisticTestVisualizationMethod.Confidence,
  );

  const {
    multiSelectProps: subdatasetSelectProps,
    categories: chosenSubdatasets,
  } = useCategoriesAxisMultiSelect({
    supportedCategories: data.groups,
    column: undefined,
  });

  const { Component: AlphaSlider, filter: filterAlpha } =
    useVisualizationAlphaSlider();

  // region Plot
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!method) return undefined;
    const dictionaryEntry =
      PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY[method];
    const usedTitle = `Pairwise ${dictionaryEntry!.label}s of the Subdatasets on ${config.column} Data`;
    const hovertemplates = [
      `<b>Subdataset</b>: %{y}<br><b>${config.column}</b>: %{x}<br>`,
    ];

    const methodOptions = Object.values(
      PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY,
    );
    for (let i = 0; i < methodOptions.length; i++) {
      const entry = methodOptions[i]!;
      hovertemplates.push(`<b>${entry.hoverLabel}</b>: %{customdata[${i}]}`);
    }

    const results = chosenSubdatasets.map((row) => {
      return chosenSubdatasets.map((col) => {
        return data.results.find(
          (result) =>
            result.groups[0]?.name === row && result.groups[1]?.name === col,
        );
      });
    });
    const confidenceLevels = map2D(results, (result) =>
      result == null ? undefined : (1 - result.significance.p_value) * 100,
    );
    const effectSizes = map2D(results, (result) =>
      result == null ? undefined : result.effect_size.value,
    );

    const customdata = zip2D([confidenceLevels, effectSizes]);
    let usedValue: (number | undefined)[][];
    if (method === PairwiseStatisticTestVisualizationMethod.Confidence) {
      usedValue = confidenceLevels;
    } else if (method === PairwiseStatisticTestVisualizationMethod.EffectSize) {
      usedValue = effectSizes;
    } else {
      return undefined;
    }
    const invalidMask = map2D(
      results,
      (x) => !!x && !filterAlpha(x?.significance.p_value),
    );

    const [minZ, maxZ] = getBalancedHeatmapZRange(usedValue as number[][]);
    const needsMinMaxZ =
      method === PairwiseStatisticTestVisualizationMethod.EffectSize;

    return {
      data: [
        {
          type: 'heatmap',
          texttemplate: '%{z:.3f}',
          x: chosenSubdatasets,
          y: chosenSubdatasets,
          z: mask2D(usedValue, invalidMask, undefined as any),
          customdata: customdata as any,
          hovertemplate: hovertemplates.join('<br>'),
          colorscale: dictionaryEntry.colorscale,
          zmin: needsMinMaxZ ? minZ : undefined,
          zmax: needsMinMaxZ ? maxZ : undefined,
          colorbar: {
            title: usedTitle,
          },
        },
      ],
      layout: {
        title: `${usedTitle}`,
        yaxis: {
          title: 'Subdatasets',
          automargin: true,
          autorange: 'reversed',
        },
        xaxis: {
          title: 'Subdatasets',
          automargin: true,
        },
      },
    };
  }, [method, config.column, chosenSubdatasets, data.results, filterAlpha]);

  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select
          data={PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_OPTIONS}
          value={method}
          onChange={setMethod as any}
          allowDeselect={false}
        />
        <MultiSelect
          {...subdatasetSelectProps}
          label="Select Subdatasets"
          description="Select the subdatasets to be included in the heatmap"
        />
        {AlphaSlider}
      </PlotInlineConfiguration>
      <StatisticTestEmptyPlotWarning
        invalid={!plot}
        hasRowsCols
        hasFrequency={false}
        hasAlpha
      >
        {plot && <PlotRenderer plot={plot} scrollZoom={false} />}
      </StatisticTestEmptyPlotWarning>
    </Stack>
  );
}
