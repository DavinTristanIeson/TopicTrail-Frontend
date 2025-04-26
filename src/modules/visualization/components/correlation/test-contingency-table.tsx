import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestonDistributionConfigType } from '../../configuration/test-distribution';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack } from '@mantine/core';
import { VisualizationBinaryStatisticTestOnContingencyTableMainModel } from '@/api/correlation';
import PlotRenderer from '@/components/widgets/plotly';

import { map2D, mask2D, sort2D, zip2D } from '@/common/utils/iterable';
import {
  BinaryStatisticTestVisualizationType,
  PlotInlineConfiguration,
  useBinaryStatisticTestVisualizationMethodSelect,
  useCategoriesAxisMultiSelect,
  usePlotRendererHelperProps,
  useVisualizationAlphaSlider,
  useVisualizationMinFrequencySlider,
} from '../configuration';
import { max } from 'lodash-es';

function VisualizationBinaryStatisticTestOnContingencyTableInternal(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
) {
  const { item } = props;
  const data = props.data[0]!.data!;

  // region Configuration
  const {
    multiSelectProps: columnsSelectProps,
    categories: columns,
    indexed: indexColumns,
  } = useCategoriesAxisMultiSelect({
    supportedCategories: data.columns,
    column: data.column2,
  });
  const {
    multiSelectProps: rowsSelectProps,
    categories: rows,
    indexed: indexRows,
  } = useCategoriesAxisMultiSelect({
    supportedCategories: data.rows,
    column: data.column1,
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
    const rowIndices = indexRows(rows);
    const columnIndices = indexColumns(columns);
    const process = (arr: number[][]) =>
      sort2D(mask2D(arr, invalid, 0), rowIndices, columnIndices);
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

    const effectSizeMethodConstraints = {
      zmin: -1,
      zmax: 1,
    };
    const customdata = sort2D(
      zip2D([pValues, confidences, statistics, effectSizes, frequencies]),
      rowIndices,
      columnIndices,
    );
    const hovertemplate = [
      `<b>${item.column}</b>: %{x}`,
      `<b>${item.config.target}</b>: %{y}`,
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>Chi-Squared Statistic</b>: %{customdata[2]}`,
      `<b>Yule's Q</b>: %{customdata[3]}`,
      '<b>Frequency</b>: %{customdata[4]}',
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
    };
  }, [
    data,
    indexRows,
    rows,
    indexColumns,
    columns,
    item,
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
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
        },
      ],
      layout: {
        title: `Frequencies of ${item.column}`,
      },
    };
  }, [columns, item.column, rows, values]);

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
          colorscale: 'RdBu',
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
          ...effectSizeMethodConstraints,
        },
      ],
      layout: {
        title: `Effect Sizes of How Values of ${item.column} Correlates With Values of ${item.config.target}`,
      },
    };
  }, [columns, item, rows, values]);

  const confidenceLevelsPlot = React.useMemo<PlotParams>(() => {
    const { confidences, customdata, hovertemplate, process } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: process(confidences),
          colorscale: 'Greens',
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
          zmin: 0,
          zmax: 100,
        },
      ],
      layout: {
        title: `Confidence Level of How Values of ${item.column} Correlates With Values of ${item.config.target}`,
      },
    };
  }, [columns, item, rows, values]);

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
      <PlotRenderer plot={usedPlot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}

export default function VisualizationBinaryStatisticTestOnContingencyTableComponent(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
) {
  const data = props.data[0]?.data;
  const item = props.item;
  if (!data?.rows || data.columns.length === 0) {
    throw new Error(
      `It seems that ${item.column} doesn't contain any values at all in the dataset so we cannot use them as binary variables.`,
    );
  }
  if (!data?.columns || data.columns.length === 0) {
    throw new Error(
      `It seems that ${item.config.target} doesn't contain any values at all in the dataset so we cannot use them as binary variables.`,
    );
  }
  return (
    <VisualizationBinaryStatisticTestOnContingencyTableInternal {...props} />
  );
}
