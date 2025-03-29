import { TopicModel } from '@/api/topic';
import React from 'react';
import {
  Badge,
  Button,
  HoverCard,
  NavLink,
  Paper,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { TopicInfo } from '@/modules/topics/components/info';
import { AndTableFilterModel, TableFilterModel } from '@/api/table';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { getTopicColumnName, TextualSchemaColumnModel } from '@/api/project';
import { FilterStateContext } from '@/modules/table/context';
import { CaretRight } from '@phosphor-icons/react';

interface RefineTopicsTopicListProps {
  column: TextualSchemaColumnModel;
  topics: TopicModel[];
}

function getTopicValuesFromTopicFilters(
  column: string,
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
  if (topicOperand.target !== column) {
    return null;
  }
  return topicOperand.values as number[];
}

function TopicListRenderer(props: RefineTopicsTopicListProps) {
  const { column, topics } = props;

  const { filter, setFilter } = React.useContext(FilterStateContext);

  const topicColumnName = getTopicColumnName(column.name);
  const activeTopicIds = React.useMemo(() => {
    return getTopicValuesFromTopicFilters(topicColumnName, filter) ?? [];
  }, [filter, topicColumnName]);

  const setTopicFilter = React.useCallback(
    (topic: TopicModel) => {
      setFilter((prev) => {
        const filterTopicValues = getTopicValuesFromTopicFilters(
          topicColumnName,
          prev,
        );
        if (filterTopicValues == null) {
          return {
            type: TableFilterTypeEnum.And,
            operands: [
              {
                type: TableFilterTypeEnum.IsOneOf,
                target: topicColumnName,
                values: [topic.id],
              },
            ],
          };
        }

        const filter = prev as AndTableFilterModel;
        const prevTopicIdx = filterTopicValues.indexOf(topic.id);
        if (prevTopicIdx === -1) {
          filterTopicValues.push(topic.id);
        } else {
          filterTopicValues.splice(prevTopicIdx, 1);
        }
        return {
          ...filter,
          operands: [
            {
              type: TableFilterTypeEnum.IsOneOf,
              target: topicColumnName,
              values: filterTopicValues,
            },
            ...filter.operands.slice(1),
          ],
        };
      });
    },
    [setFilter, topicColumnName],
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
                leftSection={<Badge color="brand.4">{topic.id + 1}</Badge>}
                rightSection={<CaretRight />}
                onClick={() => {
                  setTopicFilter(topic);
                }}
                label={topic.label}
              />
            </HoverCard.Target>
            <HoverCard.Dropdown className="max-w-lg">
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
