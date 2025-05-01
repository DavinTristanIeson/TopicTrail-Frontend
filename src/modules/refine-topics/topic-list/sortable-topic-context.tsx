// Needs to be separated due to Gridstack import causing issues
import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import { TopicWordsRenderer } from '@/modules/topics/components/info';
import { TopicUpdateFormType } from '../form-type';

interface ReorderTopicOrderDndContextProps {
  topics: TopicUpdateFormType[];
  setTopics: React.Dispatch<React.SetStateAction<TopicUpdateFormType[]>>;
}

function accessTopicIdentifier(item: TopicUpdateFormType) {
  return item.id.toString();
}

export default function ReorderTopicOrderDndContext(
  props: ReorderTopicOrderDndContextProps,
) {
  const { topics, setTopics } = props;

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: topics.map(accessTopicIdentifier),
    options: {
      ...SortableGridStackDefaultOptions({
        itemsCount: topics.length,
      }),
      cellHeight: 100,
    },
  });

  useSortableGridStack({
    grid,
    setValues: setTopics,
    getId: accessTopicIdentifier,
  });

  return (
    <div id={id} className="grid-stack">
      {topics.map((topic) => (
        <div
          className="grid-stack-item"
          key={topic.id}
          ref={gridElements.current![topic.id.toString()]}
        >
          <Paper className="p-3 select-none grid-stack-item-content">
            <Stack>
              <Group>
                {!topic.original && <Badge>New</Badge>}
                <Text>{topic.label}</Text>
              </Group>
              {topic.original && (
                <TopicWordsRenderer words={topic.original?.words} />
              )}
            </Stack>
          </Paper>
        </div>
      ))}
    </div>
  );
}
