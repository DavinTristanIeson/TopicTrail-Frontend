import { Card, Title, Divider, useMantineTheme } from '@mantine/core';
import React from 'react';

interface TaskControlsCardProps {
  title?: string;
  children?: React.ReactNode;
}

export function TaskControlsCard(props: TaskControlsCardProps) {
  const { title, children } = props;
  const { colors } = useMantineTheme();
  return (
    <Card
      withBorder
      p="lg"
      radius="lg"
      style={{
        backgroundColor: 'white',
        borderLeft: `5px solid ${colors.brand[4]}`,
      }}
    >
      {title && (
        <>
          <Title order={2} c="brand">
            {title}
            <Divider my="sm" size="sm" color="#7a84b9" />
          </Title>
        </>
      )}
      {children}
    </Card>
  );
}
