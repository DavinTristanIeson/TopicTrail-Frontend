import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  ProjectContext,
  useProjectColumnField,
} from '@/modules/project/context';
import { Group } from '@mantine/core';
import {
  StatisticMethodSelectField,
  EffectSizeSelectField,
} from './select-statistic-test-method';
import { SUPPORTED_COLUMN_TYPES_FOR_STATISTIC_TEST } from '../dictionary';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { filterProjectColumnsByType } from '@/api/project';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import RHFField from '@/components/standard/fields';

export function StatisticTestMethodFormBody() {
  const columnType = useProjectColumnField('column')?.type as
    | SchemaColumnTypeEnum
    | undefined;
  if (!columnType) return;
  return (
    <Group className="w-full">
      <StatisticMethodSelectField
        name="statistic_test_preference"
        type="select"
        label="Statistic Test"
        className="flex-1"
        description="What test method do you want to use in this statistic test?"
        columnType={columnType}
        required
      />
      <EffectSizeSelectField
        name="effect_size_preference"
        type="select"
        className="flex-1"
        label="Effect Size"
        description="What effect size do you want to use in this statistic test?"
        columnType={columnType}
        required
      />
    </Group>
  );
}

export function StatisticTestProjectColumnSelectField() {
  const { setValue } = useFormContext<{
    effect_size_preference: string | null;
    statistic_test_preference: string | null;
  }>();
  const columnType = useProjectColumnField('column')?.type as
    | SchemaColumnTypeEnum
    | undefined;
  const project = React.useContext(ProjectContext);
  const columns = filterProjectColumnsByType(
    project,
    SUPPORTED_COLUMN_TYPES_FOR_STATISTIC_TEST,
  );
  return (
    <ProjectColumnSelectField
      data={columns}
      name="column"
      label="Target"
      required
      error={
        columns.length === 0
          ? 'There are no columns in your dataset that supports statistic tests.'
          : undefined
      }
      description="The column that will be used for the statistic test."
      onChange={(combobox) => {
        const type = combobox?.type as SchemaColumnTypeEnum;
        if (type !== columnType) {
          setValue('effect_size_preference', null as any);
          setValue('statistic_test_preference', null as any);
        }
      }}
    />
  );
}

export function ExcludeOverlappingRowsCheckbox() {
  return (
    <RHFField
      name="exclude_overlapping_rows"
      label="Exclude overlapping rows"
      description="Statistic tests that assume independence can be unreliable if the samples are non-independent or have overlapping data points. We recommend that you ensure all of your subdatasets are independent or have very few overlap with each other. Alternatively, you can also exclude overlapping rows to ensure independence, but at the loss of the statistical test's power - especially if there are a lot of overlapping rows between your subdatasets."
      type="switch"
    />
  );
}
