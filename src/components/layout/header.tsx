import { Button, Group, Paper, Title } from '@mantine/core';
import React from 'react';
import GlobalConfig from '@/common/constants/global';
import { DoorOpen } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import { useElementSize } from '@mantine/hooks';

interface AppHeaderProps {
  title?: string;
  Right?: React.ReactNode;
}

export default function AppHeader(props: AppHeaderProps) {
  return (
    <Group className="flex-1" gap={8}>
      <Title order={1}>{props.title ?? GlobalConfig.AppName}</Title>
      {props.Right}
    </Group>
  );
}

export function GoBackHeader() {
  const { back } = useRouter();
  const { height, ref } = useElementSize();
  return (
    <>
      <Paper className="absolute top-0 left-0 w-full p-3" radius={0} ref={ref}>
        <Group justify="end">
          <Button
            variant="outline"
            leftSection={<DoorOpen />}
            onClick={() => {
              back();
            }}
          >
            Return
          </Button>
        </Group>
      </Paper>
      <div style={{ height: Math.max(72, height ?? 0) }} />
    </>
  );
}
