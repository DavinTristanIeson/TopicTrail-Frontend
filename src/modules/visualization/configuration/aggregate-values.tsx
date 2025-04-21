import * as Yup from 'yup';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import {
  SchemaColumnTypeEnum,
  TableColumnAggregateMethodEnum,
} from '@/common/constants/enum';
import RHFField from '@/components/standard/fields';
import { Group } from '@mantine/core';
import {
  FrequencyDistributionDisplayModeSelectField,
  VisualizationFrequencyDistributonDisplayMode,
} from './frequency-distribution';
import { CATEGORICAL_SCHEMA_COLUMN_TYPES } from '@/api/project';

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

export function VisualizationAggregateValuesConfigForm() {
  const project = React.useContext(ProjectContext);
  const columns = React.useMemo(() => {
    return project.config.data_schema.columns.filter((column) =>
      CATEGORICAL_SCHEMA_COLUMN_TYPES.includes(
        column.type as SchemaColumnTypeEnum,
      ),
    );
  }, [project.config.data_schema.columns]);
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
        <RHFField
          type="select"
          name="config.method"
          label="Aggregation Method"
          description="Once the data has been grouped, how are they combined into a single value?"
          className="flex-1"
          data={[
            {
              value: TableColumnAggregateMethodEnum.Sum,
              label: 'Sum the values',
            },
            {
              value: TableColumnAggregateMethodEnum.Mean,
              label: 'Get the average',
            },
            {
              value: TableColumnAggregateMethodEnum.Max,
              label: 'Get the maximum value',
            },
            {
              value: TableColumnAggregateMethodEnum.Min,
              label: 'Get the minimum value',
            },
            {
              value: TableColumnAggregateMethodEnum.Median,
              label: 'Get the median',
            },
            {
              value: TableColumnAggregateMethodEnum.StandardDeviation,
              label: 'Get the standard deviation',
            },
          ]}
          required
          allowDeselect={false}
        />
      </Group>
      <FrequencyDistributionDisplayModeSelectField />
    </>
  );
}
