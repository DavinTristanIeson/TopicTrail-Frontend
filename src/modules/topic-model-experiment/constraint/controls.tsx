import RHFField from '@/components/standard/fields';
import FormWrapper from '@/components/utility/form/wrapper';
import { TaskControlsCard } from '@/modules/task/controls';
import { TopicCoherenceExplanation } from '@/modules/topic-evaluation/controls';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActionIcon,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
} from '@mantine/core';
import { Lock, LockOpen, X } from '@phosphor-icons/react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import {
  TopicModelHyperparameterConstraintFormType,
  TopicModelHyperparameterConstraintSchema as topicModelHyperparameterConstraintSchema,
} from './form-type';
import React from 'react';
import { useCurrentTopicModelExperimentAppState } from '../app-state';
import SubmitButton from '@/components/standard/button/submit';
import { useTopicAppState } from '@/modules/topics/app-state';
import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';
import { ProjectContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';
import { FormEditableContext } from '@/components/standard/fields/context';
import PromiseButton from '@/components/standard/button/promise';
import { handleError } from '@/common/utils/error';
import { TopicModelExperimentEnvironment } from '@/api/topic';
import { ErrorAlert } from '@/components/standard/fields/watcher';

interface NumericHyperparameterRangeFieldProps {
  label: string;
  description: string;
  defaultValue: number;
  name: string;
  min: number;
}

function NumericHyperparameterRangeField(
  props: NumericHyperparameterRangeFieldProps,
) {
  const { label, description, name, min, defaultValue } = props;
  const { setValue, clearErrors } = useFormContext();
  const hyperparameterRange = useWatch({ name });
  const isHyperparameterLocked = hyperparameterRange == null;
  const { editable } = React.useContext(FormEditableContext);

  return (
    <div>
      <Group className="pb-3">
        <ActionIcon
          variant="light"
          onClick={() => {
            if (isHyperparameterLocked) {
              setValue(name, [defaultValue, defaultValue]);
            } else {
              setValue(name, null);
            }
            clearErrors(name);
          }}
          disabled={!editable}
          color={isHyperparameterLocked ? 'red' : 'green'}
        >
          {isHyperparameterLocked ? <Lock /> : <LockOpen />}
        </ActionIcon>
        <Text fw={500} size="sm">
          {label}
        </Text>
      </Group>
      <Group align="start">
        <RHFField
          type="number"
          name={`${name}[0]`}
          min={min}
          key={`${isHyperparameterLocked}-0`}
          disabled={isHyperparameterLocked}
          className="flex-1"
        />
        <RHFField
          type="number"
          name={`${name}[1]`}
          key={`${isHyperparameterLocked}-1`}
          min={min}
          disabled={isHyperparameterLocked}
          className="flex-1"
        />
      </Group>
      <Text size="xs" c="gray">
        {description}
      </Text>
    </div>
  );
}

function TopicModelExperimentHyperparameterControlsFormBody() {
  const column = useTopicAppState((store) => store.column!);
  const topicModelResult = useTopicModelingResultOfColumn(column.name);
  const topics = topicModelResult!.result!.topics;
  return (
    <Stack>
      <ErrorAlert />
      <RHFField
        type="number"
        name="n_trials"
        label="Number of trials"
        min={5}
        required
        description="Number of trials to conduct to find the optimal hyperparameters. You may need a much larger number of trials for bigger hyperparameter ranges."
      />
      <NumericHyperparameterRangeField
        label="Min. Topic Size"
        description="The range of min. topic size to test out."
        defaultValue={column.topic_modeling.min_topic_size}
        min={2}
        name="constraint.min_topic_size"
      />
      <NumericHyperparameterRangeField
        label="Topic Confidence Threshold"
        description="The range of topic confidence threshold to test out. We recommend testing ranges that are the same as min. topic size."
        defaultValue={column.topic_modeling.topic_confidence_threshold ?? 15}
        min={2}
        name="constraint.topic_confidence_threshold"
      />
      <NumericHyperparameterRangeField
        label="Topic Count"
        description="The range of topics that the model should strive for. The hyperparameter optimization algorithm will be encouraged to produce hyperparameters that causes BERTopic to produce more topics than the minimum topic count. The upper topic count limit will be used as the max. topics hyperparameter for BERTopic."
        defaultValue={topics.length}
        min={1}
        name="constraint.topic_count"
      />
    </Stack>
  );
}

function TopicModelExperimentExplanation() {
  return (
    <Stack>
      <Text>
        Perhaps the topics discovered by the topic modeling algorithm was not
        satisfactory enough for you. This may be because of suboptimal
        hyperparameter selection. In this page, you can tinker with various
        hyperparameters that affect the topic assignments produced by BERTopic.
        We will then test combinations of the hyperparameters defined by your
        constraint to find out the best combination of hyperparameters that
        maximizes{' '}
        <Popover withArrow position="top">
          <Popover.Target>
            <Text inherit span fw={500} c="brand">
              topic coherence
            </Text>
          </Popover.Target>
          <Popover.Dropdown>
            <TopicCoherenceExplanation />
          </Popover.Dropdown>
        </Popover>
        .
      </Text>
      <Text>
        Hyperparameters that are{' '}
        <Text c="red" span>
          locked
        </Text>{' '}
        means that the hyperparameter originally configured for this column
        should be used instead.
      </Text>
      <Text c="red">
        For performance reasons, we do not allow you to experiment with
        hyperparameters that will make the experiments take much longer, such as
        the hyperparameters that affect the generation of document vectors and
        dimensionality-reduced vectors, or affects preprocessing.
      </Text>
    </Stack>
  );
}

export default function TopicModelExperimentHyperparameterControls() {
  const { environment, setEnvironment } =
    useCurrentTopicModelExperimentAppState();
  const form = useForm({
    resolver: yupResolver(topicModelHyperparameterConstraintSchema),
    defaultValues: React.useMemo(() => {
      return {
        constraint: {
          topic_count: environment?.constraint?.topic_count ?? null,
          min_topic_size: environment?.constraint?.min_topic_size ?? null,
          topic_confidence_threshold:
            environment?.constraint?.topic_confidence_threshold ?? null,
        },
        n_trials: environment?.n_trials ?? 5,
      } as TopicModelHyperparameterConstraintFormType;
    }, [
      environment?.constraint?.min_topic_size,
      environment?.constraint?.topic_confidence_threshold,
      environment?.constraint?.topic_count,
      environment?.n_trials,
    ]),
  });

  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const { editable } = React.useContext(FormEditableContext);

  const params = {
    path: {
      project_id: project.id,
    },
    query: {
      column: column.name,
    },
  };
  const { mutateAsync: startTopicModelExperiment } = client.useMutation(
    'post',
    '/topic/{project_id}/experiment/start',
    {
      onSuccess() {
        const queryKey = client.queryOptions(
          'get',
          '/topic/{project_id}/experiment/status',
          {
            params,
          },
        ).queryKey;
        queryClient.refetchQueries({ queryKey });
      },
    },
  );
  const { mutateAsync: cancelTopicModelExperiment } = client.useMutation(
    'patch',
    '/topic/{project_id}/experiment/cancel',
    {
      onSuccess() {
        const queryKey = client.queryOptions(
          'get',
          '/topic/{project_id}/experiment/status',
          {
            params,
          },
        ).queryKey;
        queryClient.refetchQueries({ queryKey });
      },
    },
  );
  return (
    <TaskControlsCard title="Topic Model Hyperparameter Experiments">
      <TopicModelExperimentExplanation />
      <Divider className="my-5" />
      <FormWrapper
        form={form}
        onSubmit={async (values: TopicModelExperimentEnvironment) => {
          const res = await startTopicModelExperiment({
            params,
            body: values,
          });
          if (res.message) {
            showNotification({
              message: res.message,
              color: 'green',
            });
          }
          setEnvironment(values);
        }}
      >
        <TopicModelExperimentHyperparameterControlsFormBody />
        <Group justify="end" className="pt-5">
          <SubmitButton disabled={!editable}>Start Experiments</SubmitButton>
          {!editable && (
            <PromiseButton
              variant="outline"
              color="red"
              leftSection={<X />}
              onClick={async () => {
                try {
                  const res = await cancelTopicModelExperiment({
                    params,
                  });
                  if (res.message) {
                    showNotification({
                      message: res.message,
                      color: 'green',
                    });
                  }
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              Cancel Experiment
            </PromiseButton>
          )}
        </Group>
      </FormWrapper>
    </TaskControlsCard>
  );
}
