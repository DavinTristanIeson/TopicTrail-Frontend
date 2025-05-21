import SubmitButton from '@/components/standard/button/submit';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { Group, Space } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestConfig, StatisticTestPurpose } from '../types';
import React from 'react';

interface StatisticTestFormProps {
  purpose: StatisticTestPurpose;
  defaultValues: StatisticTestConfig | undefined;
  onSubmit(config: StatisticTestConfig): void;
}

export default function StatisticTestForm(props: StatisticTestFormProps) {
  const { purpose, defaultValues, onSubmit } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];

  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }

  const form = useForm({
    defaultValues: defaultValues ?? configItem.configValidator.getDefault(),
    resolver: yupResolver(configItem.configValidator),
  });

  const handleSubmit = React.useCallback(
    (values: any) => {
      const statisticTestInput = configItem.configValidator.cast(values, {
        stripUnknown: true,
      });
      return onSubmit(statisticTestInput);
    },
    [configItem.configValidator, onSubmit],
  );

  const ConfigForm = configItem.configForm;
  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <ConfigForm />
      <Space h="lg" />
      <Group justify="center">
        <SubmitButton leftSection={<TestTube />} fullWidth className="max-w-md">
          Perform Statistic Test
        </SubmitButton>
      </Group>
    </FormWrapper>
  );
}
