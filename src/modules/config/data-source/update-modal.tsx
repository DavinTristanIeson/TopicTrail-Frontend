import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import React from 'react';
import { useVerifyUpdateModalDataSource } from './check';
import { useForm, useFormContext } from 'react-hook-form';
import {
  ProjectConfigDataSourceUpdateModalFormSchema,
  ProjectConfigFormType,
} from '../form-type';
import { Button, Flex, LoadingOverlay, Modal, Stack } from '@mantine/core';
import { ProjectConfigDataSourceFormBody } from './form-body';
import { yupResolver } from '@hookform/resolvers/yup';
import { CheckCircle } from '@phosphor-icons/react';
import FormWrapper from '@/components/utility/form/wrapper';
import { CancelButton } from '@/components/standard/button/variants';

export const ProjectConfigDataSourceUpdateModal = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function ProjectConfigDataSourceUpdateModal(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);

  const { getValues } = useFormContext<ProjectConfigFormType>();
  const form = useForm({
    mode: 'onChange',
    defaultValues: { source: getValues('source') },
    resolver: yupResolver(ProjectConfigDataSourceUpdateModalFormSchema),
  });

  React.useEffect(() => {
    form.reset({ source: getValues('source') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const { onSubmit, isPending } = useVerifyUpdateModalDataSource(form, close);
  return (
    <Modal title="Change Dataset" size="lg" opened={opened} onClose={close}>
      <FormWrapper onSubmit={onSubmit} form={form}>
        <LoadingOverlay visible={isPending} />
        <Stack>
          <ProjectConfigDataSourceFormBody disabled={false} />
          <Flex justify="space-between" direction="row-reverse" w="100%">
            <Button
              leftSection={<CheckCircle />}
              onClick={onSubmit}
              type="button"
              loading={isPending}
            >
              Verify Dataset
            </Button>
            <CancelButton onClick={close}>Cancel</CancelButton>
          </Flex>
        </Stack>
      </FormWrapper>
    </Modal>
  );
});
