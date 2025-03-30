// Needs to be separated due to Gridstack import causing issues
import { Badge, Group, Paper, Text } from '@mantine/core';
import React from 'react';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { TopicWordsRenderer } from '@/modules/topics/components/info';
import { TopicUpdateFormType } from '../form-type';

interface ReorderCategoryOrderDndContextProps {
  topics: TopicUpdateFormType[];
  setTopicIds(ids: number[]): void;
}

export default function ReorderCategoryOrderDndContext(
  props: ReorderCategoryOrderDndContextProps,
) {
  const { topics, setTopicIds } = props;

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: topics.map((topic) => topic.id.toString()),
    options: SortableGridStackDefaultOptions({
      itemsCount: topics.length,
    }),
  });
  useSortableGridStack({
    grid,
    onSort(gridItemIds) {
      setTopicIds(
        gridItemIds.map((id) => parseInt(id)).filter((id) => !isNaN(id)),
      );
    },
  });

  return (
    <div id={id} className="grid-stack">
      {topics.map((topic) => (
        <div
          className="grid-stack-item"
          key={topic.id}
          ref={gridElements.current![topic.id.toString()]}
        >
          <Paper
            className="p-3 select-none grid-stack-item-content"
            style={{ display: 'flex' }}
          >
            <Group>
              {!topic.original && <Badge>New</Badge>}
              <Text>{topic.label}</Text>
            </Group>
            {topic.original && (
              <TopicWordsRenderer words={topic.original?.words} />
            )}
          </Paper>
        </div>
      ))}
    </div>
  );
}
