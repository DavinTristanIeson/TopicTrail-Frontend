import { ComparisonStateItemModel } from '@/api/comparison';
import NavigationRoutes from '@/common/constants/routes';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { Button, Card, Group, Table, Text } from '@mantine/core';
import { PencilSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { useComparisonAppState } from '../app-state';
import { useTableAppState } from '@/modules/table/app-state';
import { VisibilityActionIcon } from '@/components/standard/button/variants';

interface SortableComparisonStateDndContextProps {
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>;
}

interface ComparisonStateItemComponentProps {
  item: ComparisonStateItemModel;
  index: number;
  setItem(index: number, item: ComparisonStateItemModel): void;
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>;
}

function ComparisonStateItemComponent(
  props: ComparisonStateItemComponentProps,
) {
  const { item, index, editRemote, setItem } = props;
  const router = useRouter();
  const projectId = router.query.id as string;
  const setFilter = useTableAppState((store) => store.params.setFilter);
  return (
    <Group align="center" className="h-full">
      <VisibilityActionIcon
        visible={item.visible}
        setVisibility={(visible) => {
          setItem(index, {
            ...item,
            visible,
          });
        }}
      />
      <Text>{item.name}</Text>
      <div className="flex-1"></div>
      <Button
        variant="outline"
        leftSection={<Table />}
        onClick={() => {
          setFilter(item.filter);
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

export default function SortableComparisonStateDndContext(
  props: SortableComparisonStateDndContextProps,
) {
  const { editRemote } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const setItem = useComparisonAppState(
    (store) => store.groups.handlers.setItem,
  );

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: comparisonGroups.map((group) => group.name),
    options: SortableGridStackDefaultOptions({
      itemsCount: comparisonGroups.length,
    }),
  });
  useSortableGridStack({
    grid,
    onSort(gridstackIds) {
      setComparisonGroups((prev) => {
        return gridstackIds.map((id) => {
          return prev.find((namedFilter) => namedFilter.name === id)!;
        });
      });
    },
  });

  return (
    <div className="grid-stack" id={id}>
      {comparisonGroups.map((group, index) => (
        <div
          className="grid-stack-item"
          key={group.name}
          ref={gridElements.current[group.name]}
        >
          <Card
            className="select-none grid-stack-item-content"
            bg={group.visible ? undefined : 'gray.1'}
          >
            <ComparisonStateItemComponent
              item={group}
              index={index}
              setItem={setItem}
              editRemote={editRemote}
            />
          </Card>
        </div>
      ))}
    </div>
  );
}
