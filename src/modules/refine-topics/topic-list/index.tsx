import React from 'react';
import { Button, Drawer, Stack, TextInput, Text } from '@mantine/core';
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks';
import { getTopicColumnName, TextualSchemaColumnModel } from '@/api/project';
import { FilterStateContext } from '@/modules/filter/context';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
} from '@/hooks/disclosure';
import { CreateNewTopicDialog, UpdateTopicLabelDialog } from './dialogs';
import {
  getTopicValuesFromTopicFilters,
  RefineTopicsOutlierTopicListItem,
  RefineTopicsTopicListItem,
} from './item';
import { Plus } from '@phosphor-icons/react';

import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType, TopicUpdateFormType } from '../form-type';
import { getTopicLabel } from '@/api/topic';
import { TableFilterTypeEnum } from '@/common/constants/enum';
import { OUTLIER_TOPIC } from '@/modules/topics/components/select-topic-input';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';

interface TopicListRendererProps {
  column: TextualSchemaColumnModel;
  topics: TopicUpdateFormType[];
  onEdit(topicId: number): void;
}

function TopicListRenderer(props: TopicListRendererProps) {
  const { column, topics, onEdit } = props;

  const { filter, setFilter } = React.useContext(FilterStateContext);

  const topicColumnName = getTopicColumnName(column.name);
  const [activeTopicIds, setActiveTopicIds] = React.useState(() => {
    return getTopicValuesFromTopicFilters(topicColumnName, filter) ?? [];
  });

  const [topicIdsToUpdateFilter] = useDebouncedValue(activeTopicIds, 1000, {
    leading: false,
  });

  const hasChanged = React.useRef(false);
  React.useEffect(() => {
    if (!hasChanged.current) {
      return;
    }
    if (topicIdsToUpdateFilter.length === 0) {
      setFilter(null);
    } else {
      setFilter({
        type: TableFilterTypeEnum.And,
        operands: [
          {
            type: TableFilterTypeEnum.IsOneOf,
            target: topicColumnName,
            values: topicIdsToUpdateFilter,
          },
        ],
      });
    }
  }, [setFilter, topicColumnName, topicIdsToUpdateFilter]);

  const onAddTopicId = React.useCallback((topicId: number) => {
    setActiveTopicIds((prev) => {
      const prevTopicIdx = prev.indexOf(topicId);
      if (prevTopicIdx === -1) {
        return [...prev, topicId];
      } else {
        const next = prev.slice();
        next.splice(prevTopicIdx, 1);
        return next;
      }
    });
    hasChanged.current = true;
  }, []);

  return (
    <Stack>
      {topics.map((topic, index) => {
        const isActive = activeTopicIds.includes(topic.id);
        const defaultTopicLabel = topic.original
          ? getTopicLabel(topic.original)
          : 'Unnamed Topic';
        return (
          <RefineTopicsTopicListItem
            key={topic.id}
            label={topic.label ?? defaultTopicLabel}
            index={index}
            isActive={isActive}
            onEdit={() => {
              onEdit(topic.id);
            }}
            onClick={() => {
              if (!topic.original) return;
              onAddTopicId(topic.id);
            }}
            topic={topic.original}
          />
        );
      })}
      <RefineTopicsOutlierTopicListItem
        isActive={activeTopicIds.includes(OUTLIER_TOPIC.id)}
        onClick={() => {
          onAddTopicId(OUTLIER_TOPIC.id);
        }}
      />
    </Stack>
  );
}

interface RefineTopicsTopicListProps {
  column: TextualSchemaColumnModel;
}

function RefineTopicsTopicListBody(props: RefineTopicsTopicListProps) {
  const { column } = props;

  const [q, setQ] = useDebouncedState<string | null>(null, 800);

  const { control } = useFormContext<RefineTopicsFormType>();
  const topics = useWatch({
    name: 'topics',
    control,
  });

  const filteredTopics = React.useMemo(() => {
    if (!q) return topics;
    const indices = filterByString(
      q,
      topics.map((topic) => {
        return {
          label: topic.label,
          words: topic.original?.words?.map((word) => word[0]),
          tags: topic.original?.tags,
        };
      }),
    );
    return pickArrayByIndex(topics, indices);
  }, [topics, q]);

  const createNewTopicRemote = React.useRef<DisclosureTrigger | null>(null);
  const updateLabelDialogRemote =
    React.useRef<ParametrizedDisclosureTrigger<number> | null>(null);

  return (
    <>
      <CreateNewTopicDialog ref={createNewTopicRemote} />
      <UpdateTopicLabelDialog ref={updateLabelDialogRemote} />
      <Drawer.Header>
        <Stack justify="center" className="w-full" gap={4}>
          <TextInput
            label="Search for a topic"
            placeholder="Name, topic word, or tag."
            onChange={(e) => setQ(e.target.value)}
          />
          <Text ta="center" size="sm">
            alternatively, you can
          </Text>
          <Button
            onClick={() => {
              createNewTopicRemote.current?.open();
            }}
            leftSection={<Plus />}
          >
            Add a New Topic
          </Button>
        </Stack>
      </Drawer.Header>
      <TopicListRenderer
        column={column}
        topics={filteredTopics}
        onEdit={(topicId: number) => {
          updateLabelDialogRemote.current?.open(topicId);
        }}
      />
    </>
  );
}

export const RefineTopicsTopicList = React.forwardRef<
  DisclosureTrigger | null,
  RefineTopicsTopicListProps
>(function RefineTopicsTopicList(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        closeOnClickOutside
        closeOnEscape
        title="Topic List"
      >
        {opened && <RefineTopicsTopicListBody {...props} />}
      </Drawer>
    </>
  );
});
