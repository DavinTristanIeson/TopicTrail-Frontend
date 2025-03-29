import { TopicModel } from '@/api/topic';
import React from 'react';
import {
  Button,
  HoverCard,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { TopicInfo } from '@/modules/topics/components/info';
import { AndTableFilterModel, TableFilterModel } from '@/api/table';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { TextualSchemaColumnModel } from '@/api/project';
import { FilterStateContext } from '@/modules/table/context';

interface RefineTopicsTopicListProps {
  column: TextualSchemaColumnModel;
  topics: TopicModel[];
}

function getTopicValuesFromTopicFilters(
  column: TextualSchemaColumnModel,
  filter: TableFilterModel | null,
): number[] | null {
  if (!filter) return null;
  if (
    filter.type !== TableFilterTypeEnum.And &&
    filter.type !== TableFilterTypeEnum.Or
  ) {
    return null;
  }
  const topicOperand = filter.operands[0];
  if (!topicOperand) {
    return null;
  }
  if (topicOperand.type !== TableFilterTypeEnum.IsOneOf) {
    return null;
  }
  if (topicOperand.target !== column.name) {
    return null;
  }
  return topicOperand.values as number[];
}

function TopicListRenderer(props: RefineTopicsTopicListProps) {
  const { column, topics } = props;

  const { filter, setFilter } = React.useContext(FilterStateContext);

  const activeTopicIds = React.useMemo(() => {
    return getTopicValuesFromTopicFilters(column, filter) ?? [];
  }, [column, filter]);

  const setTopicFilter = React.useCallback(
    (topic: TopicModel) => {
      setFilter((prev) => {
        const prevTopicValues = getTopicValuesFromTopicFilters(column, prev);
        if (prevTopicValues == null) {
          return {
            type: TableFilterTypeEnum.And,
            operands: [
              {
                type: TableFilterTypeEnum.IsOneOf,
                target: column.name,
                values: [topic.id],
              },
            ],
          };
        }

        const filter = prev as AndTableFilterModel;
        return {
          ...filter,
          operands: [
            {
              type: TableFilterTypeEnum.IsOneOf,
              target: column.name,
              values: [...prevTopicValues, topic.id],
            },
            ...filter.operands.slice(1),
          ],
        };
      });
    },
    [column, setFilter],
  );

  return (
    <Stack>
      {topics.map((topic) => {
        const isActive = activeTopicIds.includes(topic.id);
        return (
          <HoverCard key={topic.id}>
            <HoverCard.Target>
              <NavLink
                active={isActive}
                component="button"
                onClick={() => {
                  setTopicFilter(topic);
                }}
                label={topic.label}
              />
            </HoverCard.Target>
            <HoverCard.Dropdown className="max-w-md">
              <TopicInfo {...topic} />
            </HoverCard.Dropdown>
          </HoverCard>
        );
      })}
    </Stack>
  );
}

export default function RefineTopicsTopicList(
  props: RefineTopicsTopicListProps,
) {
  const { column, topics } = props;

  const [q, setQ] = useDebouncedState<string | null>(null, 800);

  const filteredTopics = React.useMemo(() => {
    if (!q) return topics;
    return topics.filter((topic) => {
      const matchesLabel = !!topic.label && topic.label.includes(q);
      const matchesTopicWords = topic.words.map((word) => word[0]).includes(q);
      const matchesTags = !!topic.tags && topic.tags.includes(q);
      return matchesLabel || matchesTopicWords || matchesTags;
    });
  }, [q, topics]);

  return (
    <Stack style={{ height: '90dvh' }}>
      <Paper className="p-2">
        <TextInput
          label="Search for a topic"
          placeholder="Name or tag."
          onChange={(e) => setQ(e.target.value)}
        />
      </Paper>
      <Paper className="p-2 overflow-auto flex-1">
        <TopicListRenderer column={column} topics={filteredTopics} />
      </Paper>
      <Paper className="p-2">
        <Button>Add a New</Button>
      </Paper>
    </Stack>
  );
}
