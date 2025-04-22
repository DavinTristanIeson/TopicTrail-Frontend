import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { statisticTestFormSchema, StatisticTestFormType } from './form-type';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import FormWrapper from '@/components/utility/form/wrapper';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { ProjectContext } from '@/modules/project/context';
import { Group, Stack } from '@mantine/core';
import { NamedFilterSelectField } from '../filter/select-named-filter';
import {
  EffectSizeSelectField,
  StatisticMethodSelectField,
} from './select-statistic-test-method';
import RHFField from '@/components/standard/fields';
import { SUPPORTED_COLUMN_TYPES_FOR_STATISTIC_TEST } from './dictionary';
import SubmitButton from '@/components/standard/button/submit';
import { TestTube } from '@phosphor-icons/react';
import { useComparisonAppState } from '../app-state';

function StatisticTestFormBody() {
  const project = React.useContext(ProjectContext);
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const { setValue } = useFormContext<StatisticTestFormType>();
  const [columnType, setColumnType] =
    React.useState<SchemaColumnTypeEnum | null>(null);
  const columns = project.config.data_schema.columns.filter((column) =>
    SUPPORTED_COLUMN_TYPES_FOR_STATISTIC_TEST.includes(
      column.type as SchemaColumnTypeEnum,
    ),
  );
  return (
    <Stack>
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
          setColumnType(type ?? null);
        }}
      />
      <Group gap={8} className="w-full">
        <NamedFilterSelectField
          name="group1"
          data={comparisonGroups}
          className="flex-1"
          label="Group 1"
        />
        <NamedFilterSelectField
          name="group2"
          data={comparisonGroups}
          className="flex-1"
          label="Group 2"
        />
      </Group>
      {columnType && (
        <Group gap={8} className="w-full">
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
      )}
      <RHFField
        name="exclude_overlapping_rows"
        type="switch"
        label="Exclude overlapping rows?"
        description="We recommend that you leave this setting on. Any rows that overlap between both groups will not be used in the statistic test. This is especially important as some statistic tests like Chi-Squared Tests expect both groups to be mutually exclusive."
      />
      <Group justify="center">
        <SubmitButton leftSection={<TestTube />} fullWidth className="max-w-md">
          Perform Statistic Test
        </SubmitButton>
      </Group>
    </Stack>
  );
}

interface StatisticTestModalFormProps {
  onSubmit(input: StatisticTestFormType): void;
}

export default function StatisticTestForm(props: StatisticTestModalFormProps) {
  const { onSubmit } = props;
  const defaultValues = React.useMemo<StatisticTestFormType>(() => {
    return {
      column: '',
      effect_size_preference: null as any,
      exclude_overlapping_rows: true,
      group1: '',
      group2: '',
      statistic_test_preference: null as any,
    };
  }, []);
  const form = useForm({
    resolver: yupResolver(statisticTestFormSchema),
    mode: 'onChange',
    defaultValues,
  });
  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <StatisticTestFormBody />
    </FormWrapper>
  );
}
