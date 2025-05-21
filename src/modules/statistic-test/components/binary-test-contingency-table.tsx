import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack } from '@mantine/core';
import PlotRenderer from '@/components/widgets/plotly';

import { map2D, mask2D, sort2D, zip2D } from '@/common/utils/iterable';

import { max } from 'lodash-es';
import { BaseStatisticTestResultRendererProps } from '../types';
import { BinaryStatisticTestOnContingencyTableMainResultModel } from '@/api/statistic-test';
import { ContingencyTableConfig } from '../configuration/contingency-table';
import {
  BinaryStatisticTestVisualizationType,
  PlotInlineConfiguration,
  StatisticTestEmptyPlotWarning,
  useBinaryStatisticTestVisualizationMethodSelect,
  useCategoriesAxisMultiSelect,
  useVisualizationAlphaSlider,
  useVisualizationMinFrequencySlider,
} from '@/modules/visualization/components/configuration';
import { plotlyWrapText } from '@/modules/visualization/components/utils';

export default function BinaryStatisticTestOnContingencyTableResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    BinaryStatisticTestOnContingencyTableMainResultModel,
    ContingencyTableConfig
  >,
) {
  const { config, data } = props;

  // region Configuration
  const {
    multiSelectProps: columnsSelectProps,
    categories: columns,
    indexed: indexColumns,
  } = useCategoriesAxisMultiSelect({
    supportedCategories: data.columns,
    column: data.column,
  });
  const {
    multiSelectProps: rowsSelectProps,
    categories: rows,
    indexed: indexRows,
  } = useCategoriesAxisMultiSelect({
    supportedCategories: data.rows,
    column: undefined,
  });

  const { Component: AlphaSlider, filter: filterAlpha } =
    useVisualizationAlphaSlider();
  const { Component: VisualizationMethodSelect, type: vistype } =
    useBinaryStatisticTestVisualizationMethodSelect();

  const maxFrequency = React.useMemo(() => {
    return (
      max(
        data.results.map((result) =>
          max(result.map((resultEntry) => resultEntry.frequency) ?? 0),
        ),
      ) ?? 0
    );
  }, [data.results]);
  const { Component: FrequencySlider, filter: filterFrequency } =
    useVisualizationMinFrequencySlider({
      max: maxFrequency,
      inputProps: {
        label: 'Min. Frequency',
      },
    });

  // region Plot
  const values = React.useMemo(() => {
    const invalid = map2D(data.results, (result) => {
      return (
        !filterAlpha(result.significance.p_value) ||
        !filterFrequency(result.frequency)
      );
    });
    const isAllInvalid = invalid.every((row) => row.every((col) => col));
    const rowIndices = indexRows(rows);
    const columnIndices = indexColumns(columns);
    const process = (arr: number[][]) =>
      sort2D(
        mask2D(arr, invalid, undefined),
        rowIndices,
        columnIndices,
      ) as number[][];
    const effectSizes = map2D(
      data.results,
      (result) => result.effect_size.value,
    );
    const pValues = map2D(
      data.results,
      (result) => result.significance.p_value,
    );
    const confidences = map2D(
      data.results,
      (result) => (1 - result.significance.p_value) * 100,
    );
    const statistics = map2D(
      data.results,
      (result) => result.significance.statistic,
    );
    const frequencies = map2D(data.results, (result) => result.frequency);
    const warnings = map2D(data.results, (result) => {
      if (result.warnings.length === 0) {
        return 'None';
      }
      return result.warnings
        .map((warning) => plotlyWrapText(`- ${warning}`))
        .join('<br>');
    });

    const effectSizeMethodConstraints = {
      zmin: -1,
      zmax: 1,
    };
    const customdata = sort2D(
      zip2D<string | number>([
        pValues,
        confidences,
        statistics,
        effectSizes,
        frequencies,
        warnings,
      ]),
      rowIndices,
      columnIndices,
    );
    const hovertemplate = [
      `<b>Subdataset</b>: %{y}`,
      `<b>${config.column}</b>: %{x}`,
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>Chi-Squared Statistic</b>: %{customdata[2]}`,
      `<b>Yule's Q</b>: %{customdata[3]}`,
      '<b>Frequency</b>: %{customdata[4]}',
      '<br><b>Warnings</b>:<br>%{customdata[5]}',
    ];

    return {
      effectSizes,
      pValues,
      confidences,
      statistics,
      valid: invalid,
      frequencies,
      customdata,
      hovertemplate,
      effectSizeMethodConstraints,
      process,
      isAllInvalid,
    };
  }, [
    data.results,
    indexRows,
    rows,
    indexColumns,
    columns,
    config.column,
    filterAlpha,
    filterFrequency,
  ]);

  const frequenciesPlot = React.useMemo<PlotParams>(() => {
    const { frequencies, customdata, hovertemplate, process } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: process(frequencies),
          texttemplate: '%{z}',
          hoverongaps: false,
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
          colorscale: 'Viridis',
          colorbar: {
            title: 'Frequency',
          },
        },
      ],
      layout: {
        title: `Cooccurrence of Subdataset and ${config.column}`,
        yaxis: {
          title: config.column,
          automargin: true,
          autorange: 'reversed',
        },
        xaxis: {
          title: config.column,
          automargin: true,
        },
      },
    };
  }, [columns, config.column, rows, values]);

  const effectSizesPlot = React.useMemo<PlotParams>(() => {
    const {
      effectSizes,
      customdata,
      hovertemplate,
      effectSizeMethodConstraints,
      process,
    } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: process(effectSizes),
          texttemplate: '%{z:.3f}',
          colorscale: 'RdBu',
          hoverongaps: false,
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
          colorbar: {
            title: "Yule's Q",
          },
          ...effectSizeMethodConstraints,
        },
      ],
      layout: {
        title: `Effect Sizes of How the Subdatasets Correlates With Values of ${config.column}`,
        yaxis: {
          title: 'Subdatasets',
          automargin: true,
          autorange: 'reversed',
        },
        xaxis: {
          title: config.column,
          automargin: true,
        },
      },
    };
  }, [columns, config.column, rows, values]);

  const confidenceLevelsPlot = React.useMemo<PlotParams>(() => {
    const { confidences, customdata, hovertemplate, process } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: process(confidences),
          texttemplate: '%{z:.3f}',
          hoverongaps: false,
          colorscale: 'Viridis',
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
          zmin: 0,
          zmax: 100,
          colorbar: {
            title: 'Confidence Level',
          },
        },
      ],
      layout: {
        title: `Confidence Level of How the Subdatasets Correlates With Values of ${config.column}`,
        yaxis: {
          title: 'Subdatasets',
          automargin: true,
          autorange: 'reversed',
        },
        xaxis: {
          title: config.column,
          automargin: true,
        },
      },
    };
  }, [columns, config.column, rows, values]);

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
        {VisualizationMethodSelect}
        <MultiSelect
          {...rowsSelectProps}
          label="Select Rows"
          description="Select the rows to be included in the heatmap"
        />
        <MultiSelect
          {...columnsSelectProps}
          label="Select Columns"
          description="Select the columns to be included in the heatmap"
        />
        {AlphaSlider}
        {FrequencySlider}
      </PlotInlineConfiguration>
      <StatisticTestEmptyPlotWarning
        invalid={values.isAllInvalid}
        hasRowsCols
        hasAlpha
        hasFrequency
      >
        <PlotRenderer plot={usedPlot} scrollZoom={false} />
      </StatisticTestEmptyPlotWarning>
    </Stack>
  );
}
