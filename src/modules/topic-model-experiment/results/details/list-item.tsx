import { BERTopicExperimentTrialResultModel } from '@/api/topic';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import { Stack, Group, Alert, Text, Button } from '@mantine/core';
import { Eye } from '@phosphor-icons/react';
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
    <Stack align="center" className="min-w-48">
      <Text fw={500} c="brand">
        {label}
      </Text>
      <Text>{value}</Text>
    </Stack>
  );
}

interface TopicModelExperimentResultListItemProps {
  trial: BERTopicExperimentTrialResultModel;
  trialRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null> | null;
}
export function TopicModelExperimentResultListItem(
  props: TopicModelExperimentResultListItemProps,
) {
  const { trial, trialRemote } = props;
  return (
    <>
      <Group justify="space-between">
        <Text fw={500} c="brand">{`Trial ${trial.trial_number}`}</Text>
        {trialRemote && (
          <Button
            variant="outline"
            leftSection={<Eye />}
            onClick={() => {
              trialRemote.current?.open(trial);
            }}
          >
            View Details
          </Button>
        )}
      </Group>
      {trial.timestamp && (
        <Text c="gray">
          {dayjs(trial.timestamp).format('DD MMMM YYYY, HH:mm:ss')}
        </Text>
      )}
      <Text fw={500}>Hyperparameters</Text>
      <Group wrap="wrap">
        {trial.candidate.max_topics && (
          <TopicModelExperimentResultScore
            label="Max. Topics"
            value={trial.candidate.max_topics}
          />
        )}
        {trial.candidate.min_topic_size && (
          <TopicModelExperimentResultScore
            label="Min. Topic Size"
            value={trial.candidate.min_topic_size}
          />
        )}
        {trial.candidate.topic_confidence_threshold && (
          <TopicModelExperimentResultScore
            label="Topic Confidence Threshold"
            value={trial.candidate.topic_confidence_threshold}
          />
        )}
      </Group>
      {trial.evaluation ? (
        <>
          <Text fw={500}>Evaluation Result</Text>
          <Group wrap="wrap">
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
        </>
      ) : (
        trial.error && (
          <Alert color="red" title="This trial has failed">
            An unexpected error has occurred that caused this trial to fail.
          </Alert>
        )
      )}
    </>
  );
}
