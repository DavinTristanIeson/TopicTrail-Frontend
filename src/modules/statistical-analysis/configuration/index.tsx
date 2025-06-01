import SubmitButton from '@/components/standard/button/submit';
import FormWrapper from '@/components/utility/form/wrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import { Group, Space } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { STATISTICAL_ANALYSIS_CONFIGURATION } from '../statistic-test-config';
import { StatisticalAnalysisPurpose } from '../types';
import React from 'react';
import { showNotification } from '@mantine/notifications';

interface StatisticalAnalysisInputFormProps {
  purpose: StatisticalAnalysisPurpose;
  defaultValues: any | null | undefined;
  onSubmit(config: any): void;
}

export default function StatisticalAnalysisInputForm(
  props: StatisticalAnalysisInputFormProps,
) {
  const { purpose, defaultValues, onSubmit } = props;
  const configItem = STATISTICAL_ANALYSIS_CONFIGURATION[purpose];

  if (!configItem) {
    throw new Error(`Statistical analysis for ${purpose} is not implemented.`);
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
      onSubmit(statisticTestInput);
      showNotification({
        message: `Your request has been acknowledged. This may take a while depending on the number of your subdatasets and dataset size.`,
        color: 'green',
      });
    },
    [configItem.configValidator, onSubmit],
  );

  const ConfigForm = configItem?.configForm;
  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <ConfigForm />
      <Space h="lg" />
      <Group justify="center">
        <SubmitButton leftSection={<TestTube />} fullWidth className="max-w-md">
          {configItem.actionLabel ?? 'Execute'}
        </SubmitButton>
      </Group>
    </FormWrapper>
  );
}
