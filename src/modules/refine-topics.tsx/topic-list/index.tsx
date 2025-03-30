import React from 'react';
import { Button, Paper, Stack, TextInput } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { getTopicColumnName, TextualSchemaColumnModel } from '@/api/project';
import { FilterStateContext } from '@/modules/table/context';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { CreateNewTopicDialog, UpdateTopicLabelDialog } from './dialogs';
import {
  getTopicValuesFromTopicFilters,
  RefineTopicsTopicListItem,
} from './item';
import { Plus } from '@phosphor-icons/react';

import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType, TopicUpdateFormType } from '../form-type';

interface TopicListRendererProps {
  column: TextualSchemaColumnModel;
  topics: TopicUpdateFormType[];
  onEdit(topicId: number): void;
}

function TopicListRenderer(props: TopicListRendererProps) {
  const { column, topics, onEdit } = props;

  const { filter } = React.useContext(FilterStateContext);

  const topicColumnName = getTopicColumnName(column.name);
  const activeTopicIds = React.useMemo(() => {
    return getTopicValuesFromTopicFilters(topicColumnName, filter) ?? [];
  }, [filter, topicColumnName]);

  return (
    <Stack>
      {topics.map((topic, index) => {
        const isActive = activeTopicIds.includes(topic.id);
        return (
          <RefineTopicsTopicListItem
            key={topic.id}
            column={column}
            label={topic.label}
            index={index}
            isActive={isActive}
            onEdit={() => {
              onEdit(topic.id);
            }}
            topic={topic.original}
          />
        );
      })}
    </Stack>
  );
}

interface RefineTopicsTopicListProps {
  column: TextualSchemaColumnModel;
}

export default function RefineTopicsTopicList(
  props: RefineTopicsTopicListProps,
) {
  const { column } = props;

  const [q, setQ] = useDebouncedState<string | null>(null, 800);

  const { control } = useFormContext<RefineTopicsFormType>();
  const topics = useWatch({
    name: 'topics',
    control,
  });

  const filteredTopics = React.useMemo(() => {
    if (!q) return topics;
    return topics.filter((topic) => {
      const matchesLabel = topic.label.includes(q);
      if (!topic.original) {
        return matchesLabel;
      }
      const matchesTopicWords = topic.original.words
        .map((word) => word[0])
        .includes(q);
      const matchesTags =
        !!topic.original.tags && topic.original.tags.includes(q);
      return matchesLabel || matchesTopicWords || matchesTags;
    });
  }, [topics, q]);

  const createNewTopicRemote = React.useRef<DisclosureTrigger | null>(null);
  const updateLabelDialogRemote =
    React.useRef<ParametrizedDisclosureTrigger<number> | null>(null);

  return (
    <>
      <CreateNewTopicDialog ref={createNewTopicRemote} />
      <UpdateTopicLabelDialog ref={updateLabelDialogRemote} />
      <Paper className="p-2" style={{ height: '90dvh' }}>
        <Stack className="h-full">
          <TextInput
            label="Search for a topic"
            placeholder="Name or tag."
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="h-full overflow-auto">
            <TopicListRenderer
              column={column}
              topics={filteredTopics}
              onEdit={(topicId: number) => {
                updateLabelDialogRemote.current?.open(topicId);
              }}
            />
          </div>
          <Button
            onClick={() => {
              createNewTopicRemote.current?.open();
            }}
            leftSection={<Plus />}
          >
            Add New Topic
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
