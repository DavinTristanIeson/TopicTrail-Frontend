import { ComparisonStatisticTestInput } from '@/api/comparison';
import React from 'react';
import { NamedFiltersContext } from '../context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { statisticTestFormSchema, StatisticTestFormType } from './form-type';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import FormWrapper from '@/components/utility/form/wrapper';
import { showNotification } from '@mantine/notifications';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { ProjectContext } from '@/modules/project/context';
import { Group, Stack } from '@mantine/core';
import { NamedFilterSelectField } from '../filter/select-named-filter';
import { StatisticMethodSelectField } from './select-statistic-test-method';
import RHFField from '@/components/standard/fields';

function StatisticTestFormBody() {
  const project = React.useContext(ProjectContext);
  const { filters } = React.useContext(NamedFiltersContext);
  const [columnType, setColumnType] =
    React.useState<SchemaColumnTypeEnum | null>(null);
  return (
    <Stack>
      <ProjectColumnSelectField
        data={project.config.data_schema.columns}
        name="column"
        label="Target"
        required
        description="The column that will be used for the statistic test."
        onChange={(combobox) => {
          const type = combobox?.type as SchemaColumnTypeEnum;
          setColumnType(type ?? null);
        }}
      />
      <Group gap={8} className="w-full">
        <NamedFilterSelectField
          name="group1"
          data={filters}
          className="flex-1"
          label="Group 1"
        />
        <NamedFilterSelectField
          name="group2"
          data={filters}
          className="flex-1"
          label="Group 2"
        />
      </Group>
      {columnType && (
        <Group gap={8} className="w-full">
          <StatisticMethodSelectField
            name="statistic_test_preference"
            type="select"
            className="flex-1"
            description="What test method do you want to use in this statistic test?"
            columnType={columnType}
          />
          <StatisticMethodSelectField
            name="effect_size_preference"
            type="select"
            className="flex-1"
            label="Effect Size"
            description="What effect size do you want to use in this statistic test?"
            columnType={columnType}
          />
        </Group>
      )}
      <RHFField
        name="exclude_overlapping_rows"
        type="switch"
        label="Exclude overlapping rows?"
        description="We recommend that you leave this setting on. Any rows that overlap between both groups will not be used in the statistic test. This is especially important as some statistic tests like Chi-Squared Tests expect both groups to be mutually exclusive."
      />
    </Stack>
  );
}

interface StatisticTestModalFormProps {
  setInput: React.Dispatch<
    React.SetStateAction<ComparisonStatisticTestInput | null>
  >;
}

export default function StatisticTestForm(props: StatisticTestModalFormProps) {
  const { setInput } = props;
  const { filters } = React.useContext(NamedFiltersContext);
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

  const onSubmit = React.useCallback(
    (values: StatisticTestFormType) => {
      setInput({
        ...values,
        group1: filters.find((filter) => values.group1 === filter.name)!,
        group2: filters.find((filter) => values.group2 === filter.name)!,
      });
      showNotification({
        message: 'Please wait a while until the statistic test is finished...',
        loading: true,
        color: 'green',
      });
    },
    [filters, setInput],
  );
  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <StatisticTestFormBody />
    </FormWrapper>
  );
}
