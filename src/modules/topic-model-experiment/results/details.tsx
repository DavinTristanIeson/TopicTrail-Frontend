import {
  BERTopicExperimentResultModel,
  BERTopicExperimentTrialResultModel,
} from '@/api/topic';
import {
  Alert,
  Card,
  Checkbox,
  Group,
  Input,
  Select,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
  TopicModelExperimentResultSortBy,
  useTopicModelExperimentAppState,
} from '../app-state';
import React from 'react';

interface TopicModelExperimentResultScoreProps {
  label: string;
  value: number;
}

function TopicModelExperimentResultScore(
  props: TopicModelExperimentResultScoreProps,
) {
  const { label, value } = props;
  return (
    <Stack align="center">
      <Text fw={500} c="brand">
        {label}
      </Text>
      <Text>{value}</Text>
    </Stack>
  );
}

interface TopicModelExperimentResultCardProps {
  trial: BERTopicExperimentTrialResultModel;
}
function TopicModelExperimentResultCard(
  props: TopicModelExperimentResultCardProps,
) {
  const { trial } = props;
  return (
    <Card>
      <Group justify="space-between">
        <Text fw={500} c="brand">{`Trial ${trial.trial_number}`}</Text>
        {trial.timestamp && (
          <Text c="gray">
            {dayjs(trial.timestamp).format('DD MMMM YYYY, HH:mm:ss')}
          </Text>
        )}
      </Group>
      {trial.evaluation ? (
        <Group>
          <TopicModelExperimentResultScore
            label="Coherence"
            value={trial.evaluation.coherence_v}
          />
          <TopicModelExperimentResultScore
            label="Diversity"
            value={trial.evaluation.topic_diversity}
          />
          <TopicModelExperimentResultScore
            label="Topic Count"
            value={trial.evaluation.coherence_v_per_topic.length}
          />
        </Group>
      ) : (
        <Alert color="red" title="This trial has failed">
          {trial.error ??
            'An unexpected error has occurred that caused this trial to fail.'}
        </Alert>
      )}
    </Card>
  );
}

interface TopicModelExperimentSortBySelectProps {
  value: TopicModelExperimentResultSortBy | null;
  onChange: React.Dispatch<
    React.SetStateAction<TopicModelExperimentResultSortBy | null>
  >;
}

export function TopicModelExperimentResultSortBySelect(
  props: TopicModelExperimentSortBySelectProps,
) {
  const { value, onChange } = props;
  return (
    <Select
      value={value}
      onChange={onChange as React.Dispatch<React.SetStateAction<string | null>>}
      label="Sort by"
      allowDeselect={false}
      data={[
        {
          group: 'Hyperparameters',
          items: [
            {
              label: 'Max. Topics',
              value: TopicModelExperimentResultSortBy.MaxTopics,
            },
            {
              label: 'Min. Topic Size',
              value: TopicModelExperimentResultSortBy.MinTopicSize,
            },
            {
              label: 'Topic Confidence Threshold',
              value: TopicModelExperimentResultSortBy.TopicConfidenceThreshold,
            },
          ],
        },
        {
          group: 'Evaluation Results',
          items: [
            {
              label: 'Topic Coherence',
              value: TopicModelExperimentResultSortBy.TopicCoherence,
            },
            {
              label: 'Topic Diversity',
              value: TopicModelExperimentResultSortBy.TopicDiversity,
            },
            {
              label: 'Topic Count',
              value: TopicModelExperimentResultSortBy.TopicCount,
            },
          ],
        },
        {
          group: 'Others',
          items: [
            {
              label: 'Trial Number',
              value: TopicModelExperimentResultSortBy.TrialNumber,
            },
          ],
        },
      ]}
    />
  );
}

interface TopicModelExperimentResultsTabProps {
  result: BERTopicExperimentResultModel;
}

export default function TopicModelExperimentResultsTab(
  props: TopicModelExperimentResultsTabProps,
) {
  const { result } = props;
  const sortBy = useTopicModelExperimentAppState((store) => store.sortBy);
  const setSortBy = useTopicModelExperimentAppState((store) => store.setSortBy);
  const showFailed = useTopicModelExperimentAppState(
    (store) => store.showFailed,
  );
  const setShowFailed = useTopicModelExperimentAppState(
    (store) => store.setShowFailed,
  );

  return (
    <Stack>
      <Group align="start">
        <TopicModelExperimentResultSortBySelect
          value={sortBy}
          onChange={setSortBy}
        />
        <Input.Wrapper label="Show failed trials">
          <Switch
            checked={showFailed}
            onChange={(e) => setShowFailed(e.target.checked)}
            label="Should the failed trials be shown as well?"
          />
        </Input.Wrapper>
      </Group>
    </Stack>
  );
}
