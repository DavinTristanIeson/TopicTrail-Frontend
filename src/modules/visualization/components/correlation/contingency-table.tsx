import { VisualizationContingencyTableModel } from '@/api/correlation';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationContingencyTableConfigType } from '../../configuration/contingency-table';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import { MultiSelect, Select, Stack } from '@mantine/core';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import type { PlotParams } from 'react-plotly.js';
import { fromPairs, max } from 'lodash-es';
import { map2D, mask2D, sort2D, zip2D } from '@/common/utils/iterable';
import {
  PlotInlineConfiguration,
  useCategoriesAxisMultiSelect,
  usePlotRendererHelperProps,
  useVisualizationMinFrequencySlider,
} from '../configuration';
import { getBalancedHeatmapZRange } from '../configuration/heatmap';

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

function VisualizationContingencyTableHeatmapInner(
  props: BaseVisualizationComponentProps<
    VisualizationContingencyTableModel,
    VisualizationContingencyTableConfigType
  >,
) {
  const { data: dataContainer, item } = props;

  const { data } = dataContainer[0]!;

  // region Configuration
  const [method, setMethod] = React.useState(
    ContingencyTableVisualizationMethod.Observed,
  );

  const inputContainer = useSelectLeftRightButtons({
    value: method,
    onChange: setMethod,
    options: CONTINGENCY_TABLE_METHOD_OPTIONS.map((opt) => opt.value),
  });

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

  const maxFrequency = React.useMemo(
    () => max(data.observed.map(max)) ?? 0,
    [data.observed],
  );
  const { Component: FrequencySlider, filter: filterFrequency } =
    useVisualizationMinFrequencySlider({
      max: maxFrequency,
      inputProps: {
        label: 'Min. Frequency',
      },
    });

  // region Plot
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (rows.length === 0 || columns.length === 0) return undefined;

    const basePicker = {
      [ContingencyTableVisualizationMethod.Observed]: data.observed,
      [ContingencyTableVisualizationMethod.Expected]: data.expected,
      [ContingencyTableVisualizationMethod.Residuals]: data.residuals,
      [ContingencyTableVisualizationMethod.StandardizedResiduals]:
        data.standardized_residuals,
    };
    const colorscale = {
      [ContingencyTableVisualizationMethod.Observed]: 'Greens',
      [ContingencyTableVisualizationMethod.Expected]: 'Greens',
      [ContingencyTableVisualizationMethod.Residuals]: 'RdBu',
      [ContingencyTableVisualizationMethod.StandardizedResiduals]: 'RdBu',
    };
    const picker = fromPairs(
      Object.entries(basePicker).map((x) => {
        const sorted = sort2D(
          x[1],
          indexRows(data.rows),
          indexColumns(data.columns),
        );
        return [x[0], sorted];
      }),
    );
    const customdata = zip2D(Object.values(picker));
    const usedValue = picker[method]!;

    const usedTitle = CONTINGENCY_TABLE_METHOD_DICTIONARY[method].title;
    const hovertemplates = [
      `<b>${data.column1.name}</b>: %{y}<br><b>${data.column2.name}</b>: %{x}<br>`,
    ];

    const methodOptions = Object.values(CONTINGENCY_TABLE_METHOD_DICTIONARY);
    for (let i = 0; i < methodOptions.length; i++) {
      const entry = methodOptions[i]!;
      hovertemplates.push(`<b>${entry.hoverLabel}</b>: %{customdata[${i}]}`);
    }

    const invalidFrequencyMask = map2D(
      data.observed,
      (x) => !filterFrequency(x),
    );

    const [minZ, maxZ] = getBalancedHeatmapZRange(usedValue);

    return {
      data: [
        {
          type: 'heatmap',
          texttemplate:
            method === ContingencyTableVisualizationMethod.Observed
              ? '%{z}'
              : '%{z:.3f}',
          x: columns,
          y: rows,
          z: mask2D(usedValue, invalidFrequencyMask, 0),
          customdata: customdata as any,
          hovertemplate: hovertemplates.join('<br>'),
          colorscale: colorscale[method]!,
          zmin: minZ,
          zmax: maxZ,
          colorbar: {
            title: 'Frequency',
          },
        },
      ],
      layout: {
        title: usedTitle,
        yaxis: {
          title: item.column,
          automargin: true,
        },
        xaxis: {
          title: item.config.target,
          automargin: true,
        },
      },
    };
  }, [
    rows,
    columns,
    data,
    method,
    item,
    indexRows,
    indexColumns,
    filterFrequency,
  ]);

  const plotProps = usePlotRendererHelperProps(item);

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
        {FrequencySlider}
      </PlotInlineConfiguration>
      {plot && <PlotRenderer plot={plot} {...plotProps} scrollZoom={false} />}
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
