import { BERTopicExperimentResultModel } from '@/api/topic';
import { Affix, Card, Group, Loader, Text } from '@mantine/core';

interface TopicModelExperimentLoadingAffixProps {
  data: BERTopicExperimentResultModel | null | undefined;
  isStillPolling: boolean;
}

export function TopicModelExperimentLoadingNotification(
  props: TopicModelExperimentLoadingAffixProps,
) {
  const { data, isStillPolling } = props;
  if (!isStillPolling) {
    return null;
  }
  return (
    <Affix>
      <Card>
        <Group>
          <Loader />
          <Text>
            The experiments are still in progress...
            {data?.trials.length
              ? ` (${data?.trials.length} / ${data?.max_trials})`
              : ''}
          </Text>
        </Group>
      </Card>
    </Affix>
  );
}
