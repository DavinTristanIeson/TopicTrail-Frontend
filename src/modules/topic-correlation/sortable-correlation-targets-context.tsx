import NavigationRoutes from '@/common/constants/routes';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { Button, Card, Group, HoverCard, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';
import { useTableAppState } from '@/modules/table/app-state';
import {
  useCheckTopicCorrelationTargetSpecificVisibility,
  useTopicCorrelationAppState,
  useTopicCorrelationAppStateTopicColumn,
} from './app-state';
import { getTopicLabel, TopicModel } from '@/api/topic';
import { VisibilityActionIcon } from '@/components/standard/button/variants';
import { TopicInfo } from '../topics/components/info';
import { Table } from '@phosphor-icons/react';

interface CorrelationTargetItemComponentProps {
  topic: TopicModel;
}

const CorrelationTargetItemComponent = React.memo(
  function CorrelationTargetItemComponent(
    props: CorrelationTargetItemComponentProps,
  ) {
    const { topic } = props;
    const router = useRouter();
    const projectId = router.query.id as string;

    const { topicColumn } = useTopicCorrelationAppStateTopicColumn();
    const { visible, toggle } =
      useCheckTopicCorrelationTargetSpecificVisibility(topic.id);
    const setFilter = useTableAppState((store) => store.params.setFilter);

    return (
      <Card
        className="select-none grid-stack-item-content"
        bg={visible ? undefined : 'gray.1'}
      >
        <Group className="h-full">
          <VisibilityActionIcon visible={visible} setVisibility={toggle} />
          <HoverCard>
            <HoverCard.Target>
              <Text>{getTopicLabel(topic)}</Text>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <TopicInfo {...topic} />
            </HoverCard.Dropdown>
          </HoverCard>
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
                      value: topic.id,
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
      </Card>
    );
  },
);

export default function SortableTopicCorrelationTopicsDndContext() {
  const correlationTargets = useTopicCorrelationAppState(
    (store) => store.topics,
  )!;
  const setCorrelationTargets = useTopicCorrelationAppState(
    (store) => store.setTopics,
  );

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: correlationTargets.map((target) => target.id.toString()),
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
          return prev.find((target) => target.id.toString() === id)!;
        });
      });
    },
  });

  return (
    <div className="grid-stack" id={id}>
      {correlationTargets.map((target) => (
        <div
          className="grid-stack-item"
          key={target.id}
          ref={gridElements.current[target.id.toString()]}
        >
          <CorrelationTargetItemComponent topic={target} />
        </div>
      ))}
    </div>
  );
}
