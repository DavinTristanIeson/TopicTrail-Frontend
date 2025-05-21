import SubmitButton from '@/components/standard/button/submit';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { Group } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestPurpose } from '../types';
import React from 'react';
import { useComparisonAppState } from '@/modules/comparison/app-state';

interface StatisticTestFormProps {
  purpose: StatisticTestPurpose;
}

export default function StatisticTestForm(props: StatisticTestFormProps) {
  const { purpose } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];
  const currentConfig = useComparisonAppState(
    (store) => store.statisticTest.current,
  );
  const setCurrentConfig = useComparisonAppState(
    (store) => store.statisticTest.setCurrent,
  );
  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }

  const form = useForm({
    defaultValues: currentConfig ?? configItem.configValidator.getDefault(),
    resolver: yupResolver(configItem.configValidator),
  });

  const onSubmit = React.useCallback(
    (values: any) => {
      const newConfig = configItem.configValidator.cast(values, {
        stripUnknown: true,
      });
      return setCurrentConfig(newConfig);
    },
    [configItem.configValidator, setCurrentConfig],
  );

  const ConfigForm = configItem.configForm;
  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <ConfigForm />
      <Group justify="center">
        <SubmitButton leftSection={<TestTube />} fullWidth className="max-w-md">
          Perform Statistic Test
        </SubmitButton>
      </Group>
    </FormWrapper>
  );
}
