import { DashboardItemModel } from '@/api/userdata';
import { ActionIcon, Group, Paper } from '@mantine/core';
import { CornersOut, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import React from 'react';

interface DashboardGridItemProps {
  item: DashboardItemModel;
  onEdit: ((item: DashboardItemModel) => void) | undefined;
  onDelete: ((item: DashboardItemModel) => void) | undefined;
  onFullScreen: ((item: DashboardItemModel) => void) | undefined;
}

export default function DashboardGridItem(props: DashboardGridItemProps) {
  const { item, onEdit, onDelete, onFullScreen } = props;
  return (
    <Paper className="grid-stack-item-content p-2 select-none">
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
    </Paper>
  );
}
