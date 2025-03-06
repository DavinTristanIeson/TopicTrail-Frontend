import { Button, Group, Title } from '@mantine/core';
import { DoorOpen } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { DisclosureTrigger } from '@/hooks/disclosure';
import ConfirmationDialog from '../widgets/confirmation';

interface AppHeaderProps {
  back?: boolean;
  title?: string;
  warnNavigation?: boolean;
}

export default function AppHeader(props: AppHeaderProps) {
  const router = useRouter();
  const confirmRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <ConfirmationDialog
        message="Are you sure you want to go back? This will abort the project creation process and all of the values you inputted will be lost."
        onConfirm={async () => {
          router.back();
        }}
        positiveAction="Go Back"
        ref={confirmRemote}
      />
      <Group justify="space-between" className="flex-1">
        {props.back && (
          <Button
            variant="outline"
            leftSection={<DoorOpen />}
            onClick={() => {
              if (props.warnNavigation) {
                confirmRemote.current?.open();
              } else {
                router.back();
              }
            }}
          >
            Go Back
          </Button>
        )}
        <Title order={1}>{props.title ?? 'WORDSMITH'}</Title>
      </Group>
    </>
  );
}
