import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestConfigType } from '../../configuration/binary-statistic-test';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { MultiSelect, Stack } from '@mantine/core';
import { VisualizationBinaryStatisticTestOnContingencyTableMainModel } from '@/api/correlation';
import PlotRenderer from '@/components/widgets/plotly';

import { useDebouncedValue } from '@mantine/hooks';
import { map2D, mask2D, sort2D, zip2D } from '@/common/utils/iterable';
import { PlotInlineConfiguration, usePlotRendererHelperProps } from '../utils';
import {
  useContingencyTableAxisMultiSelect,
  useVisualizationAlphaSlider,
  useBinaryStatisticTestVisualizationMethodSelect,
  BinaryStatisticTestVisualizationType,
} from './utils';

function VisualizationBinaryStatisticTestOnContingencyTableInternal(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestConfigType
  >,
) {
  const { item } = props;
  const data = props.data[0]!.data!;

  const {
    multiSelectProps: columnsSelectProps,
    chosenIndices: rawColumnIndices,
  } = useContingencyTableAxisMultiSelect({
    supportedCategories: data.columns,
    column: data.column2,
  });
  const { multiSelectProps: rowsSelectProps, chosenIndices: rawRowIndices } =
    useContingencyTableAxisMultiSelect({
      supportedCategories: data.rows,
      column: data.column1,
    });

  const [[rows, columns, rowIndices, columnIndices]] = useDebouncedValue(
    [
      rowsSelectProps.value,
      columnsSelectProps.value,
      rawRowIndices,
      rawColumnIndices,
    ] as const,
    1000,
    {
      leading: false,
    },
  );

  const { Component: AlphaSlider, alpha } = useVisualizationAlphaSlider();
  const { Component: VisualizationMethodSelect, type: vistype } =
    useBinaryStatisticTestVisualizationMethodSelect();

  const values = React.useMemo(() => {
    const invalid = sort2D(
      map2D(data.results, (result) => result.significance.p_value > alpha),
      rowIndices,
      columnIndices,
    );
    const process = (arr: number[][]) =>
      mask2D(sort2D(arr, rowIndices, columnIndices), invalid, 0);
    const effectSizes = process(
      map2D(data.results, (result) => result.effect_size.value),
    );
    const pValues = process(
      map2D(data.results, (result) => result.significance.p_value),
    );
    const confidences = process(
      map2D(data.results, (result) => (1 - result.significance.p_value) * 100),
    );
    const statistics = process(
      map2D(data.results, (result) => result.significance.statistic),
    );
    const frequencies = sort2D(
      map2D(data.results, (result) => result.frequency),
      rowIndices,
      columnIndices,
    );

    const effectSizeMethodConstraints = {
      zmin: -1,
      zmax: 1,
    };
    const customdata = zip2D([
      pValues,
      confidences,
      statistics,
      effectSizes,
      frequencies,
    ]);
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
    };
  }, [
    alpha,
    columnIndices,
    data.results,
    item.column,
    item.config.target,
    rowIndices,
  ]);

  const frequenciesPlot = React.useMemo<PlotParams>(() => {
    const { frequencies, customdata, hovertemplate } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: frequencies,
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
    } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: effectSizes,
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
    const { confidences, customdata, hovertemplate } = values;

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: confidences,
          customdata: customdata as any,
          hovertemplate: hovertemplate.join('<br>'),
        },
      ],
      layout: {
        title: `Confidence Level of How Values of ${item.column} Correlates With Values of ${item.config.target}`,
        zmin: 0,
        zmax: 100,
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
        {vistype !== BinaryStatisticTestVisualizationType.Frequencies &&
          AlphaSlider}
      </PlotInlineConfiguration>
      <PlotRenderer plot={usedPlot} {...usePlotRendererHelperProps(item)} />
    </Stack>
  );
}

export default function VisualizationBinaryStatisticTestOnContingencyTableComponent(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestConfigType
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
