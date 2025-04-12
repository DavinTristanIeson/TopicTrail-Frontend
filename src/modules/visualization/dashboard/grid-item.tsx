import { DashboardItemModel } from '@/api/userdata';
import { ActionIcon, Alert, Button, Group, Paper, Stack } from '@mantine/core';
import {
  ArrowCounterClockwise,
  CornersOut,
  PencilSimple,
  TrashSimple,
} from '@phosphor-icons/react';
import {
  ErrorBoundary,
  ErrorComponent,
} from 'next/dist/client/components/error-boundary';
import React from 'react';

interface DashboardGridItemProps {
  item: DashboardItemModel;
  onEdit: ((item: DashboardItemModel) => void) | undefined;
  onDelete: ((item: DashboardItemModel) => void) | undefined;
  onFullScreen: ((item: DashboardItemModel) => void) | undefined;
}

function DashboardGridItemErrorBoundary(
  props: React.ComponentProps<ErrorComponent>,
) {
  const { error, reset } = props;
  return (
    <Alert color="red" title="Oops, an unexpected error has occurred!">
      <Stack>
        {error.message}
        <Button onClick={reset} leftSection={<ArrowCounterClockwise />}>
          Refresh
        </Button>
      </Stack>
    </Alert>
  );
}

export default function DashboardGridItem(props: DashboardGridItemProps) {
  const { item, onEdit, onDelete, onFullScreen } = props;
  return (
    <Paper className="grid-stack-item-content p-2 select-none">
      <ErrorBoundary errorComponent={DashboardGridItemErrorBoundary}>
        <Group className="pb-2">
          {onFullScreen && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => onFullScreen(item)}
            >
              <CornersOut size={24} />
            </ActionIcon>
          )}
          <div className="flex-1" />
          {onEdit && (
            <ActionIcon variant="subtle" onClick={() => onEdit(item)}>
              <PencilSimple size={24} />
            </ActionIcon>
          )}
          {onDelete && (
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => onDelete(item)}
            >
              <TrashSimple size={24} />
            </ActionIcon>
          )}
        </Group>
        Renderer
      </ErrorBoundary>
    </Paper>
  );
}
