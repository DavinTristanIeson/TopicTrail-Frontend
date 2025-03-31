import { TableFilterModel } from '@/api/table';
import { TopicModel } from '@/api/topic';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { TopicInfo } from '@/modules/topics/components/info';
import { OUTLIER_TOPIC } from '@/modules/topics/results/select-topic-input';
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
  return topicOperand.values.slice() as number[];
}

interface TopicListItemProps {
  topic: TopicModel | null;
  label: string;
  isActive: boolean;
  index: number;
  onEdit(): void;
  onClick(): void;
}

export function RefineTopicsTopicListItem(props: TopicListItemProps) {
  const { topic, isActive, index, onClick, onEdit, label } = props;

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
          <ActionIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
          >
            <PencilSimple />
          </ActionIcon>
          {topic && <CaretRight />}
        </Group>
      }
      onClick={() => {
        if (!topic) return;
        onClick();
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

interface RefineTopicsOutlierTopicListItemProps {
  isActive: boolean;
  onClick(): void;
}

export function RefineTopicsOutlierTopicListItem(
  props: RefineTopicsOutlierTopicListItemProps,
) {
  const { isActive, onClick } = props;
  return (
    <NavLink
      active={isActive}
      component="button"
      rightSection={<CaretRight />}
      onClick={onClick}
      label="Outlier"
      description={OUTLIER_TOPIC.description}
    />
  );
}
