import { PairwiseStatisticTestResultModel } from '@/api/statistic-test';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { Alert, MultiSelect, Select, Stack } from '@mantine/core';
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
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Info } from '@phosphor-icons/react';

enum PairwiseStatisticTestVisualizationMethod {
  Confidence = 'confidence',
  EffectSize = 'effect_size',
  SampleSize = 'sample_size',
}

const PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY = {
  [PairwiseStatisticTestVisualizationMethod.Confidence]: {
    label: 'Confidence Level',
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
  [PairwiseStatisticTestVisualizationMethod.SampleSize]: {
    label: 'Sample Size',
    value: PairwiseStatisticTestVisualizationMethod.SampleSize,
    description: 'Show the sample sizes of each statistic test.',
    hoverLabel: 'Confidence',
    colorscale: 'Viridis',
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
      `<b>Subdataset 1</b>: %{y}</b><b>Subdataset 2</b>: %{x}`,
    ];

    const methodOptions = Object.values(
      PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY,
    );
    for (let i = 0; i < methodOptions.length; i++) {
      const entry = methodOptions[i]!;
      hovertemplates.push(`<b>${entry.hoverLabel}</b>: %{customdata[${i}]}`);
    }
    hovertemplates.push(
      `<b>Warnings</b>:<br>%{customdata[${hovertemplates.length - 1}]}`,
    );

    const results = chosenSubdatasets.map((row) => {
      return chosenSubdatasets.map((col) => {
        return data.results.find(
          (result) =>
            result.groups[0]?.name === col && result.groups[1]?.name === row,
        );
      });
    });

    const confidenceLevels = map2D(results, (result) =>
      result == null ? undefined : (1 - result.significance.p_value) * 100,
    );
    const effectSizes = map2D(results, (result) =>
      result == null ? undefined : result.effect_size.value,
    );
    const sampleSizes = map2D(results, (result) =>
      result == null ? undefined : result.sample_size,
    );
    const warnings = map2D(results, (result) =>
      result == null
        ? undefined
        : result.warnings.map((warning) => `- ${warning}`).join('<br>'),
    );

    const customdata = zip2D([
      confidenceLevels,
      effectSizes,
      sampleSizes,
      warnings as any,
    ]);
    let usedValue: (number | undefined)[][];
    if (method === PairwiseStatisticTestVisualizationMethod.Confidence) {
      usedValue = confidenceLevels;
    } else if (method === PairwiseStatisticTestVisualizationMethod.EffectSize) {
      usedValue = effectSizes;
    } else if (method === PairwiseStatisticTestVisualizationMethod.SampleSize) {
      usedValue = sampleSizes;
    } else {
      return undefined;
    }
    const invalidMask = map2D(
      results,
      (x) => !!x && !filterAlpha(x?.significance.p_value),
    );
    const z = mask2D(usedValue, invalidMask, undefined as any);
    const hasValues = z.some((row) => row.some(Boolean));
    if (!hasValues) return undefined;

    let minZ: number | undefined = undefined;
    let maxZ: number | undefined = undefined;
    if (method === PairwiseStatisticTestVisualizationMethod.EffectSize) {
      [minZ, maxZ] = getBalancedHeatmapZRange(usedValue as number[][]);
    } else if (method === PairwiseStatisticTestVisualizationMethod.Confidence) {
      minZ = 0;
      maxZ = 100;
    }
    return {
      data: [
        {
          type: 'heatmap',
          texttemplate:
            method === PairwiseStatisticTestVisualizationMethod.SampleSize
              ? '%{z}'
              : '%{z:.3f}',
          x: chosenSubdatasets,
          y: chosenSubdatasets,
          z,
          customdata: customdata as any,
          hoverongaps: false,
          hovertemplate: hovertemplates.join('<br>'),
          colorscale: dictionaryEntry.colorscale,
          zmin: minZ,
          zmax: maxZ,
          colorbar: {
            title: dictionaryEntry.hoverLabel,
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

  const renderOption = useDescriptionBasedRenderOption(
    PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_DICTIONARY,
  );

  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select
          data={PAIRWISE_STATISTIC_TEST_VISUALIZATION_METHOD_OPTIONS}
          value={method}
          onChange={setMethod as any}
          label="Visualization Method"
          required
          renderOption={renderOption}
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
        <Alert color="blue" icon={<Info />}>
          The p values of the pairwise statistic tests have been corrected using
          the Benjamini-Hochberg correction in order to prevent false positives.
        </Alert>
        {plot && <PlotRenderer plot={plot} scrollZoom={false} />}
      </StatisticTestEmptyPlotWarning>
    </Stack>
  );
}
