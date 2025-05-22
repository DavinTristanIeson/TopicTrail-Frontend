import React from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import {
  RefineTopicsFormType,
  topicUpdateFormSchema,
  TopicUpdateFormType,
  createNewTopicFormSchema,
} from '../form-type';
import { yupResolver } from '@hookform/resolvers/yup';
import FormWrapper from '@/components/utility/form/wrapper';
import { Button, Collapse, Group, Stack } from '@mantine/core';
import SubmitButton from '@/components/standard/button/submit';
import RHFField from '@/components/standard/fields';
import { showNotification } from '@mantine/notifications';
import { getTopicLabel, TopicModel } from '@/api/topic';
import { VisualizationWordCloudRenderer } from '@/modules/visualization/components/textual/renderer';
import { useDisclosure } from '@mantine/hooks';
import { Eye } from '@phosphor-icons/react';

interface TopicUpdateFormProps {
  topicId: number;
  onClose(): void;
}

interface TopicUpdateFormBodyProps {
  isCreate: boolean;
}

function TopicUpdateFormBody(props: TopicUpdateFormBodyProps) {
  const { isCreate } = props;
  return (
    <>
      <RHFField
        type="text"
        name="label"
        label="Label"
        description="A label to describe the topic. By default, the label used is a combination of the first three topic words; however, this kind of label might be harder to interpret during your analysis."
        required={isCreate}
      />
      <RHFField
        type="tags"
        name="tags"
        label="Tags"
        description="Several tags to describe the topic. This is mainly to help searching for topics that fall under the same group or theme."
      />
      <RHFField
        type="textarea"
        name="description"
        label="Description"
        description="A brief description to explain the analyst's understanding of the topic."
      />
    </>
  );
}

interface TopicUpdateWordsRendererProps {
  topic: TopicModel;
}

function TopicUpdateWordsRenderer(props: TopicUpdateWordsRendererProps) {
  const { topic } = props;
  const [viewingTopic, { toggle: toggleViewingTopic }] = useDisclosure(false);
  return (
    <>
      <Button
        variant="subtle"
        leftSection={<Eye />}
        onClick={toggleViewingTopic}
      >
        View Topic Words
      </Button>
      <Collapse in={viewingTopic}>
        {viewingTopic && (
          <VisualizationWordCloudRenderer
            words={topic.words.map((word) => {
              return {
                text: word[0],
                value: word[1],
              };
            })}
            title={getTopicLabel(topic)}
            noDataPlaceholder={''}
            valueLabel={'C-TF-IDF'}
          />
        )}
      </Collapse>
    </>
  );
}

export default function TopicUpdateForm(props: TopicUpdateFormProps) {
  const { topicId, onClose } = props;
  const { getValues, setValue } = useFormContext<RefineTopicsFormType>();

  const [focusedTopic, focusedTopicIndex] = React.useMemo(() => {
    const allTopics = getValues('topics');
    const focusedTopicIndex = allTopics.findIndex(
      (topic) => topic.id != null && topic.id === topicId,
    );
    if (focusedTopicIndex === -1) {
      return [undefined, -1];
    }
    const focusedTopic = allTopics[focusedTopicIndex];
    return [focusedTopic, focusedTopicIndex];
  }, [getValues, topicId]);

  const isCreatingNewTopic = focusedTopicIndex === -1;

  const initialValues = React.useMemo(() => {
    if (focusedTopic) {
      return focusedTopic;
    }
    return {
      id: topicId,
      original: null,
      description: '',
      label: '',
      tags: [],
    } as TopicUpdateFormType;
  }, [focusedTopic, topicId]);

  const onSubmit = React.useCallback(
    (values: TopicUpdateFormType) => {
      if (isCreatingNewTopic) {
        setValue('topics', [...getValues('topics'), values]);
        showNotification({
          message: `A new topic called "${values.label}" has been successfully created. You should assign at least one document to this topic, as topics without a document assigned to it will be removed.`,
          color: 'green',
        });
      } else {
        setValue(`topics.${focusedTopicIndex}`, values);
        if (focusedTopic) {
          showNotification({
            message: `The metadata for topic "${getTopicLabel({
              ...focusedTopic.original,
              label: focusedTopic.label,
            })}" has been successfully updated.`,
            color: 'green',
          });
        } else {
          showNotification({
            message: `The metadata for the topic has been successfully updated.`,
            color: 'green',
          });
        }
      }
      onClose();
    },
    [
      focusedTopic,
      focusedTopicIndex,
      getValues,
      isCreatingNewTopic,
      onClose,
      setValue,
    ],
  );

  const form = useForm({
    resolver: yupResolver(
      isCreatingNewTopic ? createNewTopicFormSchema : topicUpdateFormSchema,
    ),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <Stack className="pt-5">
        {focusedTopic?.original && (
          <TopicUpdateWordsRenderer topic={focusedTopic.original} />
        )}
        <TopicUpdateFormBody isCreate={isCreatingNewTopic} />
        <Group justify="end">
          <SubmitButton>
            {isCreatingNewTopic ? 'Create New Topic' : 'Update Topic Metadata'}
          </SubmitButton>
        </Group>
      </Stack>
    </FormWrapper>
  );
}
