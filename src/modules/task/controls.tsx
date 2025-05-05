import { Card, Title, Divider } from '@mantine/core';
import React from 'react';

interface TaskControlsCardProps {
  title: string;
  children?: React.ReactNode;
}

export function TaskControlsCard(props: TaskControlsCardProps) {
  const { title, children } = props;
  return (
    <Card
      withBorder
      p="lg"
      radius="lg"
      style={{ backgroundColor: 'white', borderLeft: '5px solid #7a84b9' }}
    >
      <Title order={2} c="brand">
        {title}
      </Title>
      <Divider my="sm" size="sm" color="#7a84b9" />
      {children}
    </Card>
  );
}
