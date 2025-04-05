import { Alert, Text, Group, Modal, Stack, Button } from '@mantine/core';
import { UserDataInput, UserDataManagerRendererProps } from './types';
import React from 'react';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import FormWrapper from '@/components/utility/form/wrapper';

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { yupNullableArray, yupNullableString } from '@/common/utils/form';
import RHFField from '@/components/standard/fields';
import SubmitButton from '@/components/standard/button/submit';
import { TrashSimple } from '@phosphor-icons/react';
import PromiseButton from '@/components/standard/button/promise';
import { useDisclosure } from '@mantine/hooks';

const EditUserDataFormSchema = Yup.object({
  id: yupNullableString,
  name: Yup.string().required(),
  tags: yupNullableArray.of(Yup.string().required()),
  description: yupNullableString,
});

type EditUserDataFormType = Yup.InferType<typeof EditUserDataFormSchema>;

interface EditUserDataFormProps {
  initialValues: UserDataInput;
  onSave(props: UserDataInput): Promise<void>;
  onDelete: (() => void) | undefined;
}

function EditUserDataForm(props: EditUserDataFormProps) {
  const { initialValues: initialValues, onSave, onDelete } = props;

  const defaultValues = React.useMemo<EditUserDataFormType>(() => {
    return {
      id: initialValues?.id ?? null,
      name: initialValues?.name ?? '',
      description: initialValues?.description ?? '',
      tags: initialValues?.tags ?? [],
    };
  }, [initialValues]);

  const form = useForm<EditUserDataFormType>({
    resolver: yupResolver(EditUserDataFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  return (
    <FormWrapper
      form={form}
      onSubmit={(values: UserDataInput) => {
        return onSave(values);
      }}
    >
      <Stack>
        <RHFField
          type="text"
          name="name"
          label="Name"
          required
          description="Provide a unique name for the item."
        />
        <RHFField
          type="tags"
          name="tags"
          label="Tags"
          description="One or more tag to help you search for this item later on."
        />
        <RHFField
          type="textarea"
          name="description"
          label="Description"
          description="A brief description about the contents of this item."
        />
        <Group justify="end">
          {onDelete && (
            <Button
              variant="outline"
              color="red"
              leftSection={<TrashSimple />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
          <SubmitButton>Save</SubmitButton>
        </Group>
      </Stack>
    </FormWrapper>
  );
}

interface EditUserDataModalProps extends UserDataManagerRendererProps<any> {
  label: string;
}

const EditUserDataModal = React.forwardRef<
  ParametrizedDisclosureTrigger<UserDataInput> | null,
  EditUserDataModalProps
>(function EditUserDataModal(props, ref) {
  const { onSave, onDelete, label } = props;
  const [data, { close }] = useParametrizedDisclosureTrigger(ref);
  const [
    isConfirmingDeletion,
    { open: raiseDeleteConfirmation, close: dismissDeleteConfirmation },
  ] = useDisclosure();
  return (
    <Modal opened={!!data} onClose={close} title={`Save ${label}`}>
      <Stack>
        {isConfirmingDeletion && data?.id && (
          <Alert
            color="red"
            icon={<TrashSimple />}
            title="Delete Confirmation"
            withCloseButton
            onClose={dismissDeleteConfirmation}
          >
            <Stack>
              <Text inherit>
                Are you sure you want to delete{' '}
                <Text inherit fw={500}>
                  {data.name}
                </Text>
                ? You will not be able to recover the item after its deletion.
              </Text>
              <PromiseButton
                variant="outline"
                color="red"
                leftSection={<TrashSimple />}
                onClick={() => onDelete(data!.id!)}
              >
                Delete
              </PromiseButton>
            </Stack>
          </Alert>
        )}
        {data && (
          <EditUserDataForm
            initialValues={data}
            onSave={async (values) => {
              await onSave(values);
              close();
            }}
            onDelete={
              data.id && !isConfirmingDeletion
                ? raiseDeleteConfirmation
                : undefined
            }
          />
        )}
      </Stack>
    </Modal>
  );
});

export default EditUserDataModal;
