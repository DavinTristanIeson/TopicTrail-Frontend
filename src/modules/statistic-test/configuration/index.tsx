import SubmitButton from '@/components/standard/button/submit';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { Group } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestHistoryEntry, StatisticTestPurpose } from '../types';
import React from 'react';
import { useComparisonAppState } from '@/modules/comparison/app-state';

interface StatisticTestFormProps {
  purpose: StatisticTestPurpose;
}

export default function StatisticTestForm(props: StatisticTestFormProps) {
  const { purpose } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];
  const currentInput = useComparisonAppState(
    (store) => store.statisticTest.current,
  );
  const setCurrentInput = useComparisonAppState(
    (store) => store.statisticTest.setCurrent,
  );
  const appendHistory = useComparisonAppState(
    (store) => store.statisticTest.appendHistory,
  );
  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }

  const form = useForm({
    defaultValues:
      currentInput?.config ?? configItem.configValidator.getDefault(),
    resolver: yupResolver(configItem.configValidator),
  });

  const onSubmit = React.useCallback(
    (values: any) => {
      const statisticTestInput = configItem.configValidator.cast(values, {
        stripUnknown: true,
      });
      const input: StatisticTestHistoryEntry = {
        type: purpose,
        config: statisticTestInput,
      };
      setCurrentInput(input);
      appendHistory(input);
    },
    [appendHistory, configItem.configValidator, purpose, setCurrentInput],
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
