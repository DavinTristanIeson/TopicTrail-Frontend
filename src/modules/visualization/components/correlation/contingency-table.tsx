import { VisualizationContingencyTableModel } from '@/api/correlation';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationContingencyTableConfigType } from '../../configuration/contingency-table';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { Button, Group, MultiSelect, Select, Stack } from '@mantine/core';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { PlotParams } from 'react-plotly.js';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { SchemaColumnModel } from '@/api/project';
import dayjs from 'dayjs';
import { fromPairs } from 'lodash-es';
import { pickArrayByIndex } from '@/common/utils/iterable';
import { useDebouncedValue } from '@mantine/hooks';

enum ContingencyTableVisualizationMethod {
  Observed = 'observed',
  Expected = 'expected',
  Residuals = 'residuals',
  StandardizedResiduals = 'standardized_residuals',
}

const CONTINGENCY_TABLE_METHOD_DICTIONARY = {
  [ContingencyTableVisualizationMethod.Observed]: {
    label: 'Observed Data',
    value: ContingencyTableVisualizationMethod.Observed,
    title: 'Observed Frequencies',
    hoverLabel: 'Observed',
    description:
      'Show the contingency table of the data observed in the dataset.',
  },
  [ContingencyTableVisualizationMethod.Expected]: {
    label: 'Expected Data',
    value: ContingencyTableVisualizationMethod.Expected,

    title: 'Expected Frequencies',
    hoverLabel: 'Expected',
    description:
      'Show the expected frequencies of the data based on the marginal totals.',
  },
  [ContingencyTableVisualizationMethod.Residuals]: {
    label: 'Residuals',
    value: ContingencyTableVisualizationMethod.Residuals,
    title: 'Frequency Difference Between Observed and Expected Data',
    hoverLabel: 'Difference',
    description:
      'Show the absolute difference between expected data and observed data.',
  },
  [ContingencyTableVisualizationMethod.StandardizedResiduals]: {
    label: 'Standardized Residuals',
    value: ContingencyTableVisualizationMethod.StandardizedResiduals,
    description:
      'Show the relative difference between expected data and observed data. A difference of 2 indicates that the observed and expected frequencies are two standard deviations away. As a rule of thumb, you can treat any value greater than 3 (or less than -3) as abnormal values that could be investigated.',
    title:
      'Standardized Frequency Difference Between Observed and Expected Data',
    hoverLabel: 'Difference',
  },
};
const CONTINGENCY_TABLE_METHOD_OPTIONS = Object.values(
  CONTINGENCY_TABLE_METHOD_DICTIONARY,
);

interface UseContingencyTableAxisMultiSelectProps {
  supportedCategories: string[];
  column: SchemaColumnModel;
}

function useContingencyTableAxisMultiSelect(
  props: UseContingencyTableAxisMultiSelectProps,
) {
  const { supportedCategories, column } = props;
  const [categories, setCategories] =
    React.useState<string[]>(supportedCategories);

  const indexMap = React.useMemo(() => {
    return fromPairs(
      supportedCategories.map((category, index) => [category, index]),
    );
  }, [supportedCategories]);

  const chosenIndices = React.useMemo(() => {
    return categories
      .map((category) => indexMap[category]!)
      .filter((category) => category != null);
  }, [categories, indexMap]);

  const inputContainer = (children: React.ReactNode) => (
    <Group>
      <div className="flex-1">{children}</div>
      <Button
        onClick={() => {
          if (categories.length === supportedCategories.length) {
            setCategories([]);
          } else {
            setCategories(supportedCategories);
          }
        }}
        variant="subtle"
      >
        {categories.length === supportedCategories.length
          ? 'Deselect'
          : 'Select'}{' '}
        All
      </Button>
      <Button
        onClick={() => {
          if (column.type === SchemaColumnTypeEnum.Temporal) {
            setCategories((categories) => {
              const newCategories = categories
                .map(
                  (category) =>
                    [dayjs(category), category] as [dayjs.Dayjs, string],
                )
                .filter((x) => x[0].isValid())
                .sort((a, b) => a[0].diff(b[0]))
                .map((x) => x[1]);
              return newCategories;
            });
          } else if (
            column.type === SchemaColumnTypeEnum.OrderedCategorical &&
            column.category_order
          ) {
            const categoryOrder = column.category_order!;
            setCategories((categories) => {
              const newCategories = categories
                .map(
                  (category) =>
                    [category, categoryOrder.indexOf(category)] as [
                      string,
                      number,
                    ],
                )
                .map((x) => (x[1] === -1 ? ([x[0], 0] as [string, number]) : x))
                .sort((a, b) => a[1] - b[1])
                .map((x) => x[0]);
              return newCategories;
            });
          } else {
            setCategories((categories) => categories.slice().sort());
          }
        }}
        variant="subtle"
      >
        Sort
      </Button>
    </Group>
  );

  const multiSelectProps = {
    value: categories,
    inputContainer,
    onChange: setCategories,
    data: supportedCategories,
  };
  return {
    multiSelectProps,
    chosenIndices,
  };
}

function sort2D(
  arr: number[][],
  rowIndices: number[],
  columnIndices: number[],
) {
  const buffer = [];
  for (let i = 0; i < arr.length; i++) {
    // Sort by column first
    buffer.push(pickArrayByIndex(arr[i]!, columnIndices));
  }
  // Then sort by row. Order doesn't matter.
  return pickArrayByIndex(buffer, rowIndices);
}

function zip2D(arrays: number[][][]) {
  const rows = arrays[0]!.length;
  const cols = arrays[0]![0]!.length;
  const buffer: number[][][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[][] = [];
    for (let c = 0; c < cols; c++) {
      const col: number[] = [];
      for (let i = 0; i < arrays.length; i++) {
        col.push(arrays[i]![r]![c]!);
      }
      row.push(col);
    }
    buffer.push(row);
  }
  return buffer;
}

function prepareHeatmapData(
  data: VisualizationContingencyTableModel,
  rowIndices: number[],
  columnIndices: number[],
) {
  const basePicker = {
    [ContingencyTableVisualizationMethod.Observed]: data.observed,
    [ContingencyTableVisualizationMethod.Expected]: data.expected,
    [ContingencyTableVisualizationMethod.Residuals]: data.residuals,
    [ContingencyTableVisualizationMethod.StandardizedResiduals]:
      data.standardized_residuals,
  };
  const picker = fromPairs(
    Object.entries(basePicker).map((x) => [
      x[0],
      sort2D(x[1], rowIndices, columnIndices),
    ]),
  );
  const customdata = zip2D(Object.values(picker));
  let maxZ = 0,
    minZ = 0;
  for (const row of customdata) {
    for (const col of row) {
      for (const value of col) {
        maxZ = Math.max(value, maxZ);
        minZ = Math.min(value, minZ);
      }
    }
  }
  return { picker, customdata, maxZ, minZ };
}

function VisualizationContingencyTableHeatmapInner(
  props: BaseVisualizationComponentProps<
    VisualizationContingencyTableModel,
    VisualizationContingencyTableConfigType
  >,
) {
  const { data: dataContainer } = props;

  const [method, setMethod] = React.useState(
    ContingencyTableVisualizationMethod.Observed,
  );
  const { data } = dataContainer[0]!;

  const {
    multiSelectProps: columnsSelectProps,
    chosenIndices: rawColumnIndices,
  } = useContingencyTableAxisMultiSelect({
    supportedCategories: data.columns,
    column: data.column1,
  });
  const { multiSelectProps: rowsSelectProps, chosenIndices: rawRowIndices } =
    useContingencyTableAxisMultiSelect({
      supportedCategories: data.rows,
      column: data.column2,
    });

  const [columns] = useDebouncedValue(columnsSelectProps.value, 1000, {
    leading: false,
  });
  const [rows] = useDebouncedValue(rowsSelectProps.value, 1000, {
    leading: false,
  });

  const [columnIndices] = useDebouncedValue(rawColumnIndices, 1000, {
    leading: false,
  });
  const [rowIndices] = useDebouncedValue(rawRowIndices, 1000, {
    leading: false,
  });

  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (rows.length === 0 || columns.length === 0) return undefined;
    const { picker, customdata, maxZ, minZ } = prepareHeatmapData(
      data,
      rowIndices,
      columnIndices,
    );
    const zThreshold = minZ > -1 ? maxZ : (maxZ + Math.abs(minZ)) / 2;

    const usedValue = picker[method];
    const usedTitle = CONTINGENCY_TABLE_METHOD_DICTIONARY[method].title;
    const usedLabel = CONTINGENCY_TABLE_METHOD_DICTIONARY[method].hoverLabel;

    const hovertemplates = [
      `<b>${data.column1.name}</b>: %{y}<br><b>${data.column2.name}</b>: %{x}<br><b>${usedLabel}</b>: %{z}<br>----------------`,
    ];

    const methodOptions = Object.values(CONTINGENCY_TABLE_METHOD_DICTIONARY);
    for (let i = 0; i < methodOptions.length; i++) {
      const entry = methodOptions[i]!;
      if (entry.value === method) continue;
      hovertemplates.push(`<b>${entry.hoverLabel}</b>: %{customdata[${i}]}`);
    }

    return {
      data: [
        {
          type: 'heatmap',
          x: columns,
          y: rows,
          z: usedValue,
          customdata: customdata as any,
          hovertemplate: hovertemplates.join('<br>'),
          colorscale: 'RdBu',
          // So that the middlepoint of the color scale is at 0
          zmin: -zThreshold,
          zmax: zThreshold,
        },
      ],
      layout: {
        title: usedTitle,
        yaxis: {
          automargin: true,
        },
        xaxis: {
          automargin: true,
        },
      },
    };
  }, [columnIndices, columns, data, method, rowIndices, rows]);

  const inputContainer = useSelectLeftRightButtons({
    value: method,
    onChange: setMethod,
    options: CONTINGENCY_TABLE_METHOD_OPTIONS.map((opt) => opt.value),
  });

  return (
    <Stack>
      <Select
        data={CONTINGENCY_TABLE_METHOD_OPTIONS}
        value={method}
        onChange={setMethod as any}
        allowDeselect={false}
        inputContainer={inputContainer}
      />
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
      {plot && <PlotRenderer plot={plot} />}
    </Stack>
  );
}

export function VisualizationContingencyTableHeatmap(
  props: BaseVisualizationComponentProps<
    VisualizationContingencyTableModel,
    VisualizationContingencyTableConfigType
  >,
) {
  const { data } = props;
  if (data.length === 0) {
    throw new Error(
      'There are no subdatasets to view the contingency table of.',
    );
  }
  const first = data[0]!;
  if (first.data.rows.length === 0) {
    throw new Error(
      `It seems that ${first.data.column1} doesn't contain any categories at all in the dataset so we cannot calculate the contingency table.`,
    );
  }
  if (first.data.columns.length === 0) {
    throw new Error(
      `It seems that ${first.data.column2} doesn't contain any categories at all in the dataset so we cannot calculate the contingency table.`,
    );
  }
  return <VisualizationContingencyTableHeatmapInner {...props} />;
}
