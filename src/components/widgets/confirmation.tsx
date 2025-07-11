import { Text, Button, CheckIcon, Flex, Modal } from '@mantine/core';
import React from 'react';
import { TrashSimple, X } from '@phosphor-icons/react';
import PromiseButton from '../standard/button/promise';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';

interface ConfirmationDialogProps {
  title?: React.ReactNode;
  message: React.ReactNode;
  icon?: React.ReactNode;
  onConfirm(): void;
  dangerous?: boolean;
  positiveAction?: string;
}

const ConfirmationDialog = React.forwardRef<
  DisclosureTrigger | null,
  ConfirmationDialogProps
>(function ConfirmationDialog(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      title={props.title ?? 'Confirmation'}
    >
      <Text pb={16}>{props.message}</Text>
      <Flex direction="row-reverse" gap={8}>
        <PromiseButton
          variant="filled"
          leftSection={
            props.dangerous ? (props.icon ?? <TrashSimple />) : <CheckIcon />
          }
          color={props.dangerous ? 'red' : undefined}
          onClick={async () => {
            await props.onConfirm();
            close();
          }}
        >
          {props.positiveAction ?? 'Confirm'}
        </PromiseButton>
        <Button
          variant="outline"
          leftSection={<X />}
          onClick={close}
          color="red"
        >
          Cancel
        </Button>
      </Flex>
    </Modal>
  );
});

export default ConfirmationDialog;
