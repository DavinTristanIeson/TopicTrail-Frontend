import FormWrapper from '@/components/utility/form/wrapper';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';
import { DashboardItemTypeEnum } from '../types/dashboard-item-types';
import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { DashboardItemModel } from '@/api/userdata';
import { DefaultVisualizationConfigurationForm } from './default';
import {
  visualizationConfigFormSchema,
  VisualizationConfigFormType,
} from './form-type';
import { Divider, Group, Stack, Text } from '@mantine/core';
import { CancelButton } from '@/components/standard/button/variants';
import SubmitButton from '@/components/standard/button/submit';
import { useContextSelector } from 'use-context-selector';
import { DashboardConstraintContext } from '../types/context';

interface VisualizationConfigurationFormProps {
  data: DashboardItemModel | undefined;
  onClose(): void;
  onSubmit(value: DashboardItemModel): void;
}

function ExtendedVisualizationConfigurationFormBody() {
  const { control } = useFormContext<VisualizationConfigFormType>();
  const type = useWatch({
    name: 'type',
    control,
  });
  if (!type) return;
  const config = DASHBOARD_ITEM_CONFIGURATION[type];
  if (!config || !config.configForm) return;
  const ConfigForm = config.configForm;
  return (
    <>
      <Divider />
      <Text size="lg" fw={500}>
        Additional Configuration
      </Text>
      <ConfigForm />
    </>
  );
}

export default function VisualizationConfigurationForm(
  props: VisualizationConfigurationFormProps,
) {
  const { data, onSubmit, onClose } = props;

  const defaultColumn = useContextSelector(
    DashboardConstraintContext,
    (store) => store.defaultColumn,
  );

  const form = useForm<VisualizationConfigFormType>({
    resolver: yupResolver(visualizationConfigFormSchema),
    mode: 'onChange',
    defaultValues: {
      description: data?.description ?? '',
      column: data?.column ?? defaultColumn ?? '',
      type: (data?.type ?? '') as DashboardItemTypeEnum,
      config: data?.config ?? {},
    },
  });

  const handleSubmit = React.useCallback(
    (values: VisualizationConfigFormType) => {
      if (data) {
        onSubmit({
          ...data,
          ...values,
          config: values.config as any,
        });
      } else {
        onSubmit({
          ...values,
          config: values.config as any,
          description: values.description ?? null,
          id: Array.from({ length: 4 }, () =>
            Math.random().toString(16).substring(2),
          ).join('-'),
          rect: {
            height: 3,
            width: 3,
            x: 0,
            y: 0,
          },
        });
      }
      onClose();
    },
    [data, onClose, onSubmit],
  );

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <Stack>
        <DefaultVisualizationConfigurationForm />
        <ExtendedVisualizationConfigurationFormBody />
        <Group justify="end">
          <CancelButton onClick={onClose} />
          <SubmitButton>Save</SubmitButton>
        </Group>
      </Stack>
    </FormWrapper>
  );
}
