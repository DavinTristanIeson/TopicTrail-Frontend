import { getTopicColumnName, TextualSchemaColumnModel } from '@/api/project';
import { AndTableFilterModel, TableFilterModel } from '@/api/table';
import { TopicModel } from '@/api/topic';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { FilterStateContext } from '@/modules/table/context';
import { TopicInfo } from '@/modules/topics/components/info';
import { HoverCard, NavLink, Badge, Group, ActionIcon } from '@mantine/core';
import { PencilSimple, CaretRight } from '@phosphor-icons/react';
import React from 'react';

export function getTopicValuesFromTopicFilters(
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

interface TopicListItemProps {
  topic: TopicModel | null;
  label: string;
  isActive: boolean;
  index: number;
  onEdit(): void;
  column: TextualSchemaColumnModel;
}

export function RefineTopicsTopicListItem(props: TopicListItemProps) {
  const { topic, isActive, index, column, onEdit, label } = props;
  const { setFilter } = React.useContext(FilterStateContext);
  const topicColumnName = getTopicColumnName(column.name);

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

  const children = (
    <NavLink
      active={isActive}
      component="button"
      leftSection={
        <Group>
          <Badge color="brand.4">{index + 1}</Badge>
          {!topic && <Badge color="brand.4">New</Badge>}
        </Group>
      }
      rightSection={
        <Group>
          <ActionIcon onClick={onEdit}>
            <PencilSimple />
          </ActionIcon>
          <CaretRight />
        </Group>
      }
      onClick={() => {
        if (!topic) return;
        setTopicFilter(topic);
      }}
      label={label}
    />
  );

  if (!topic) {
    return children;
  }

  return (
    <HoverCard>
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown className="max-w-lg">
        <TopicInfo {...topic} label={label} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
