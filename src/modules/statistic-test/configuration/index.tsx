import SubmitButton from '@/components/standard/button/submit';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { Group } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { STATISTIC_TEST_CONFIGURATION } from '../statistic-test-config';
import { StatisticTestPurpose } from '../types';
import React from 'react';

interface ComparisonStatisticTestFormProps {
  purpose: StatisticTestPurpose;
  setConfig: (config: any) => void;
  config: any | undefined;
}

export default function ComparisonStatisticTestForm(
  props: ComparisonStatisticTestFormProps,
) {
  const { purpose, config, setConfig } = props;
  const configItem = STATISTIC_TEST_CONFIGURATION[purpose];
  if (!configItem) {
    throw new Error(`Statistic test for ${purpose} is not implemented.`);
  }

  const form = useForm({
    defaultValues: config ?? configItem.configValidator.getDefault(),
    resolver: yupResolver(configItem.configValidator),
  });

  const onSubmit = React.useCallback(
    (values: any) => {
      const newConfig = configItem.configValidator.cast(values, {
        stripUnknown: true,
      });
      return setConfig(newConfig);
    },
    [configItem.configValidator, setConfig],
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
