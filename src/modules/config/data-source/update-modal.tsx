import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import React from 'react';
import { useVerifyUpdateModalDataSource } from './check';
import { useForm, useFormContext } from 'react-hook-form';
import {
  ProjectConfigDataSourceFormSchema,
  ProjectConfigFormType,
} from '../form-type';
import { Button, Flex, LoadingOverlay, Modal, Stack } from '@mantine/core';
import { ProjectConfigDataSourceFormBody } from './form-body';
import { yupResolver } from '@hookform/resolvers/yup';
import { CheckCircle } from '@phosphor-icons/react';
import FormWrapper from '@/components/utility/form/wrapper';
import { CancelButton } from '@/components/standard/button/variants';

import * as Yup from 'yup';

const ProjectConfigDataSourceUpdateModalFormSchema = Yup.object({
  source: ProjectConfigDataSourceFormSchema,
});

interface ProjectConfigDataSourceUpdateModalFormProps {
  onClose(): void;
}

function ProjectConfigDataSourceUpdateModalForm(
  props: ProjectConfigDataSourceUpdateModalFormProps,
) {
  const { onClose } = props;
  const { getValues } = useFormContext<ProjectConfigFormType>();
  const form = useForm({
    mode: 'onChange',
    defaultValues: React.useMemo(
      () => ({ source: getValues('source') }),
      [getValues],
    ),
    resolver: yupResolver(ProjectConfigDataSourceUpdateModalFormSchema),
  });

  const { onSubmit, isPending } = useVerifyUpdateModalDataSource({
    localForm: form,
    onClose: onClose,
  });
  return (
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
  );
}

export const ProjectConfigDataSourceUpdateModal = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function ProjectConfigDataSourceUpdateModal(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  return (
    <Modal title="Change Dataset" size="xl" opened={opened} onClose={close}>
      {opened && <ProjectConfigDataSourceUpdateModalForm onClose={close} />}
    </Modal>
  );
});
