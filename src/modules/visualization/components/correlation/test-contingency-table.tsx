import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationBinaryStatisticTestConfigType } from '../../configuration/binary-statistic-test';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { Stack, useMantineTheme } from '@mantine/core';
import { VisualizationBinaryStatisticTestOnContingencyTableMainModel } from '@/api/correlation';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { zip } from 'lodash-es';
import {
  EFFECT_SIZE_DICTIONARY,
  STATISTIC_TEST_METHOD_DICTIONARY,
} from '@/modules/comparison/statistic-test/dictionary';
import PlotRenderer from '@/components/widgets/plotly';
import {
  useBinaryStatisticTestVisualizationMethodSelect,
  useVisualizationAlphaSlider,
} from './test-distribution';
import { useContingencyTableAxisMultiSelect } from './contingency-table';
import { useDebouncedValue } from '@mantine/hooks';

function VisualizationBinaryStatisticTestOnContingencyTableInternal(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestConfigType
  >,
) {
  const { item } = props;
  const { colors: mantineColors } = useMantineTheme();
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
    const discriminators = data.results.map((row) => {
      return row.map((col) => `${col.discriminator1} x ${col.discriminator2}`);
    });

    const valid = data.results.map((row) => {
      return row.map((col) => col.significance.p_value < alpha);
    });

    const effectSizes = data.results.map((row) => {
      return row.map((col) => col.effect_size.value);
    });
    const pValues = data.results.map((row) => {
      return row.map((col) => col.significance.p_value);
    });
    const confidences = data.results.map((row) => {
      return row.map((col) => (1 - col.significance.p_value) * 100);
    });
    const statistics = data.results.map((row) => {
      return row.map((col) => col.significance.statistic);
    });
    const frequencies = data.results.map((row) => {
      return row.map((col) => col.frequency);
    });

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
      frequencies,
    ];
    const hovertemplate = [
      '<b>P Value</b>: %{customdata[0]}',
      '<b>Confidence</b>: %{customdata[1]}%',
      `<b>${statisticTestMethodLabel} Statistic</b>: %{customdata[2]}`,
      `<b>${effectSizeMethodLabel}</b>: %{customdata[3]}`,
      '<b>Frequency</b>: %{customdata[4]}',
    ];

    return {
      discriminators,
      effectSizes,
      pValues,
      confidences,
      statistics,
      valid,
      frequencies,
      customdata,
      hovertemplate,
    };
  }, [alpha, data, item]);

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

export default function VisualizationBinaryStatisticTestOnContingencyTableComponent(
  props: BaseVisualizationComponentProps<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
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
  return (
    <VisualizationBinaryStatisticTestOnContingencyTableInternal {...props} />
  );
}
