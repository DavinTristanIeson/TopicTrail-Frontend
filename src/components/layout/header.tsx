import { Group, Title } from '@mantine/core';
import React from 'react';
import GlobalConfig from '@/common/constants/global';

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
