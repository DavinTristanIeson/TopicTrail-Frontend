import NavigationRoutes from '@/common/constants/routes';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { Button, Group, HoverCard, Paper, Table, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';
import { useTableAppState } from '@/modules/table/app-state';
import {
  TopicCorrelationTopicItemModel,
  useTopicCorrelationAppState,
  useTopicCorrelationAppStateTopicColumn,
} from './app-state';
import { getTopicLabel } from '@/api/topic';
import { VisibilityActionIcon } from '@/components/standard/button/variants';
import { TopicInfo } from '../topics/components/info';

interface CorrelationTargetItemComponentProps {
  item: TopicCorrelationTopicItemModel;
}

function CorrelationTargetItemComponent(
  props: CorrelationTargetItemComponentProps,
) {
  const { item } = props;
  const router = useRouter();
  const projectId = router.query.id as string;

  const { topicColumn } = useTopicCorrelationAppStateTopicColumn();
  const setCorrelationTargets = useTopicCorrelationAppState(
    (store) => store.setCorrelationTargets,
  );
  const setFilter = useTableAppState((store) => store.params.setFilter);

  const toggleVisibility = React.useCallback(() => {
    setCorrelationTargets((targets) => {
      return (
        targets?.map((target) => {
          if (target.topic.id !== item.topic.id) {
            return target;
          } else {
            return {
              ...target,
              visible: !target.visible,
            };
          }
        }) ?? null
      );
    });
  }, [item, setCorrelationTargets]);

  return (
    <Group>
      <VisibilityActionIcon
        visible={item.visible}
        setVisibility={toggleVisibility}
      />
      <HoverCard.Target>
        <Text>{getTopicLabel(item.topic)}</Text>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <TopicInfo {...item.topic} />
      </HoverCard.Dropdown>
      <div className="flex-1"></div>
      {topicColumn && (
        <Button
          variant="outline"
          leftSection={<Table />}
          onClick={() => {
            setFilter({
              type: 'and',
              operands: [
                {
                  type: 'equal_to',
                  target: topicColumn?.name,
                  value: item.topic.id,
                },
              ],
            });
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
      )}
    </Group>
  );
}

export default function SortableTopicCorrelationTopicsDndContext() {
  const correlationTargets = useTopicCorrelationAppState(
    (store) => store.correlationTargets,
  )!;
  const setCorrelationTargets = useTopicCorrelationAppState(
    (store) => store.setCorrelationTargets,
  );

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: correlationTargets.map((target) => target.topic.id.toString()),
    options: SortableGridStackDefaultOptions({
      itemsCount: correlationTargets.length,
    }),
  });
  useSortableGridStack({
    grid,
    onSort(gridstackIds) {
      setCorrelationTargets((prev) => {
        if (!prev) return prev;
        return gridstackIds.map((id) => {
          return prev.find((target) => target.topic.id.toString() === id)!;
        });
      });
    },
  });

  return (
    <div className="grid-stack" id={id}>
      {correlationTargets.map((target) => (
        <div
          className="grid-stack-item"
          key={target.topic.id}
          ref={gridElements.current[target.topic.id.toString()]}
        >
          <Paper className="p-3 select-none grid-stack-item-content">
            <CorrelationTargetItemComponent item={target} />
          </Paper>
        </div>
      ))}
    </div>
  );
}
