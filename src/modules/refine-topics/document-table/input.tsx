import {
  TopicSelectInput,
  TopicSelectInputProps,
} from '@/modules/topics/components/select-topic-input';
import { Group, Text } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType } from '../form-type';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import React from 'react';
import { ArrowClockwise, CheckCircle } from '@phosphor-icons/react';
import { client } from '@/common/api/client';
import PromiseButton from '@/components/standard/button/promise';
import { ProjectContext } from '@/modules/project/context';
import { FilterStateContext } from '@/modules/filter/context';
import { fromPairs } from 'lodash';
import { handleErrorFn } from '@/common/utils/error';

type RefineTopicsSelectTopicInputProps = Omit<
  TopicSelectInputProps,
  'data' | 'withOutlier'
>;
export function RefineTopicsSelectTopicInput(
  props: RefineTopicsSelectTopicInputProps,
) {
  const { control } = useFormContext<RefineTopicsFormType>();
  const values = useWatch({
    name: 'topics',
    control,
  });
  return (
    <TopicSelectInput
      data={values.map((value) => {
        return {
          id: value.id,
          frequency: 0,
          tags: value.tags ?? null,
          label: value.label ?? null,
          words: value.original?.words ?? [],
          description: value.description ?? null,
        };
      })}
      withOutlier
      {...props}
    />
  );
}

type RefineTopicsSelectTopicFieldProps =
  IRHFMantineAdaptable<RefineTopicsSelectTopicInputProps> &
    RefineTopicsSelectTopicInputProps;
export function RefineTopicsSelectTopicField(
  props: RefineTopicsSelectTopicFieldProps,
) {
  const { mergedProps } =
    useRHFMantineAdapter<RefineTopicsSelectTopicFieldProps>(props, {
      extractEventValue(e) {
        return e?.id ?? null;
      },
    });
  return <RefineTopicsSelectTopicInput {...mergedProps} />;
}

export default function RefineTopicsSetTopicsEnMasse() {
  const project = React.useContext(ProjectContext);
  const { filter } = React.useContext(FilterStateContext);
  const [targetTopic, setTargetTopic] = React.useState<number | null>(null);
  const { mutateAsync: getAffectedRowsMutation } = client.useMutation(
    'post',
    '/table/{project_id}/affected-rows',
  );
  const { setValue, getValues } = useFormContext<RefineTopicsFormType>();

  const getAffectedRows = React.useCallback(async () => {
    if (targetTopic == null) return [];
    const affectedRows = await getAffectedRowsMutation({
      body: {
        filter,
      },
      params: {
        path: {
          project_id: project.id,
        },
      },
    });
    return affectedRows.data;
  }, [filter, getAffectedRowsMutation, project.id, targetTopic]);

  const onMoveTopics = React.useCallback(async () => {
    if (targetTopic == null) return;

    const affectedRows = await getAffectedRows();
    const currentDocumentTopics = getValues('document_topics');
    const newDocumentTopics = fromPairs(
      affectedRows.map((row) => [row.toString(), targetTopic]),
    );

    setValue('document_topics', {
      ...currentDocumentTopics,
      ...newDocumentTopics,
    });
  }, [getAffectedRows, getValues, setValue, targetTopic]);

  const onResetTopics = React.useCallback(async () => {
    const affectedRows = await getAffectedRows();
    const currentDocumentTopics = getValues('document_topics');
    const newDocumentTopics = fromPairs(
      affectedRows.map((row) => [row.toString(), null]),
    );
    setValue('document_topics', {
      ...currentDocumentTopics,
      ...newDocumentTopics,
    });
  }, [getAffectedRows, getValues, setValue]);

  return (
    <RefineTopicsSelectTopicInput
      value={targetTopic}
      onChange={(topic) => {
        setTargetTopic(topic?.id ?? null);
      }}
      description='By selecting "Confirm", you will change the topics of all documents in this page to the selected topic.'
      inputContainer={(children) => {
        return (
          <Group className="w-full max-w-screen-md">
            <Text>Change topics to </Text>
            <div className="flex-1">{children}</div>
            <PromiseButton
              onClick={handleErrorFn(onMoveTopics)}
              disabled={targetTopic == null}
              leftSection={<CheckCircle />}
            >
              Confirm
            </PromiseButton>
            <PromiseButton
              onClick={handleErrorFn(onResetTopics)}
              leftSection={<ArrowClockwise />}
              variant="outline"
              color="red"
            >
              Reset
            </PromiseButton>
          </Group>
        );
      }}
    />
  );
}
