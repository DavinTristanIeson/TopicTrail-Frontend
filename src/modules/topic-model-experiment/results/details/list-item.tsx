import { BERTopicExperimentTrialResultModel } from '@/api/topic';
import { Stack, Card, Group, Alert, Text } from '@mantine/core';
import dayjs from 'dayjs';

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
export function TopicModelExperimentResultCard(
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
