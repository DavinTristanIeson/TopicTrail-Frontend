import * as Yup from 'yup';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { TableColumnAggregateMethodEnum } from '@/common/constants/enum';
import RHFField from '@/components/standard/fields';
import { Group } from '@mantine/core';
import {
  VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
  VisualizationFrequencyDistributonDisplayMode,
} from './frequency-distribution';
import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
} from '@/api/project';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

export const VisualizationAggregateValuesConfigSchema = Yup.object({
  grouped_by: Yup.string().required(),
  method: Yup.string()
    .oneOf(Object.values(TableColumnAggregateMethodEnum))
    .required(),
  display: Yup.string()
    .oneOf(Object.values(VisualizationFrequencyDistributonDisplayMode))
    .required(),
});

export type VisualizationAggregateValuesConfigType = Yup.InferType<
  typeof VisualizationAggregateValuesConfigSchema
>;

export const AGGREGATION_METHOD_DICTIONARY = {
  [TableColumnAggregateMethodEnum.Sum]: {
    value: TableColumnAggregateMethodEnum.Sum,
    label: 'Sum',
    description: 'Sum up all of the values in the group.',
  },
  [TableColumnAggregateMethodEnum.Mean]: {
    value: TableColumnAggregateMethodEnum.Mean,
    label: 'Average',
    description: 'Get the average value in the group.',
  },
  [TableColumnAggregateMethodEnum.Max]: {
    value: TableColumnAggregateMethodEnum.Max,
    label: 'Max',
    description: 'Get the maximum/greatest value in the group.',
  },
  [TableColumnAggregateMethodEnum.Min]: {
    value: TableColumnAggregateMethodEnum.Min,
    label: 'Min',
    description: 'Get the minimum/smallest value in the group.',
  },
  [TableColumnAggregateMethodEnum.Median]: {
    value: TableColumnAggregateMethodEnum.Median,
    label: 'Median',
    description: 'Get the middle value (median) in the group.',
  },
  [TableColumnAggregateMethodEnum.StandardDeviation]: {
    value: TableColumnAggregateMethodEnum.StandardDeviation,
    label: 'Standard Deviation',
    description: 'Get the standard deviation of the values in the group.',
  },
};

export function AggregateMethodSelectInput() {
  return (
    <RHFField
      type="select"
      name="config.method"
      label="Aggregation Method"
      description="Once the data has been grouped, how are they combined into a single value?"
      className="flex-1"
      data={Object.values(AGGREGATION_METHOD_DICTIONARY)}
      required
      allowDeselect={false}
    />
  );
}

export function VisualizationAggregateValuesConfigForm() {
  const project = React.useContext(ProjectContext);
  const columns = filterProjectColumnsByType(
    project,
    CATEGORICAL_SCHEMA_COLUMN_TYPES,
  );
  const renderOptionDisplay = useDescriptionBasedRenderOption(
    VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <>
      <Group align="start">
        <ProjectColumnSelectField
          name="config.grouped_by"
          type="select"
          label="Group by"
          data={columns}
          required
          className="flex-1"
          description="Choose a column to group the data by"
          allowDeselect={false}
        />
        <AggregateMethodSelectInput />
      </Group>
      <RHFField
        name="config.display"
        type="select"
        label="Display as"
        renderOption={renderOptionDisplay}
        data={Object.values(
          VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
        )}
        allowDeselect={false}
        required
      />
    </>
  );
}
