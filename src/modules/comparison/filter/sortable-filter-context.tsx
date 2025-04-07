import { NamedTableFilterModel } from '@/api/comparison';
import NavigationRoutes from '@/common/constants/routes';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { Button, Group, Paper, Text } from '@mantine/core';
import { Eye, PencilSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { useComparisonAppState } from '../app-state';

interface SortableNamedTableFilterDndContextProps {
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>;
}

interface NamedFilterItemComponentProps {
  item: NamedTableFilterModel;
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<NamedTableFilterModel> | null>;
}

function NamedFilterItemComponent(props: NamedFilterItemComponentProps) {
  const { item, editRemote } = props;
  const router = useRouter();
  const projectId = router.query.id as string;
  return (
    <Group>
      <Text>{item.name}</Text>
      <div className="flex-1"></div>
      {/* TODO: Table params */}
      <Button
        variant="outline"
        leftSection={<Eye />}
        onClick={() => {
          router.push({
            pathname: NavigationRoutes.ProjectTable,
            query: {
              id: projectId,
            },
          });
        }}
      >
        View Table
      </Button>
      <Button
        leftSection={<PencilSimple />}
        onClick={() => {
          editRemote.current?.open(item);
        }}
      >
        Edit
      </Button>
    </Group>
  );
}

export default function SortableNamedTableFilterDndContext(
  props: SortableNamedTableFilterDndContextProps,
) {
  const { editRemote } = props;
  const {
    state: comparisonGroups,
    handlers: { setState },
  } = useComparisonAppState((store) => store.groups);
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: comparisonGroups.map((group) => group.name),
    options: SortableGridStackDefaultOptions({
      itemsCount: comparisonGroups.length,
    }),
  });
  useSortableGridStack({
    grid,
    onSort(gridstackIds) {
      setState((prev) => {
        return gridstackIds.map((id) => {
          return prev.find((namedFilter) => namedFilter.name === id)!;
        });
      });
    },
  });

  return (
    <div className="grid-stack" id={id}>
      {comparisonGroups.map((group) => (
        <div
          className="grid-stack-item"
          key={group.name}
          ref={gridElements.current[group.name]}
        >
          <Paper className="p-3 select-none grid-stack-item-content">
            <NamedFilterItemComponent item={group} editRemote={editRemote} />
          </Paper>
        </div>
      ))}
    </div>
  );
}
