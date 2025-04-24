import { VisualizationContingencyTableModel } from '@/api/correlation';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationContingencyTableConfigType } from '../../configuration/contingency-table';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { MultiSelect, Select, Stack } from '@mantine/core';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { PlotParams } from 'react-plotly.js';
import { fromPairs } from 'lodash-es';
import { sort2D, zip2D } from '@/common/utils/iterable';
import { useDebouncedValue } from '@mantine/hooks';
import { useContingencyTableAxisMultiSelect } from './utils';
import { PlotInlineConfiguration } from '../utils';

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
    hoverLabel: 'Residual',
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
    hoverLabel: 'Standardized Residual',
  },
};
const CONTINGENCY_TABLE_METHOD_OPTIONS = Object.values(
  CONTINGENCY_TABLE_METHOD_DICTIONARY,
);

export function getHeatmapZRange(Z: number[][]): [number, number] {
  let maxZ = 0;
  let minZ = 0;
  for (const row of Z) {
    for (const col of row) {
      maxZ = Math.max(col, maxZ);
      minZ = Math.min(col, minZ);
    }
  }
  const zThreshold = minZ > -1 ? maxZ : (maxZ + Math.abs(minZ)) / 2;
  return [-zThreshold, zThreshold];
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
  return { picker, customdata };
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

  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (rows.length === 0 || columns.length === 0) return undefined;
    const { picker, customdata } = prepareHeatmapData(
      data,
      rowIndices,
      columnIndices,
    );

    const usedValue = picker[method]!;
    const [minZ, maxZ] = getHeatmapZRange(usedValue);
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
          zmin: minZ,
          zmax: maxZ,
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
      <PlotInlineConfiguration>
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
      </PlotInlineConfiguration>
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
