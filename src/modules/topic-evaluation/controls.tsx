import { Stack, Text } from '@mantine/core';
import React from 'react';
import PromiseButton from '@/components/standard/button/promise';
import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';
import { ProjectContext } from '../project/context';
import { handleError } from '@/common/utils/error';
import { Exam } from '@phosphor-icons/react';
import { showNotification } from '@mantine/notifications';
import { TaskControlsCard } from '../task/controls';
import { useTopicAppState } from '../topics/app-state';

export function TopicCoherenceExplanation() {
  return (
    <Text>
      <Text fw="bold" span>
        Topic coherence
      </Text>{' '}
      is a quantitative measure of the interpretability of a topic. They assess
      how well the words that make up a topic is supported by the actual
      documents. The metric of topic coherence used in this evaluation is C_V
      scoring which ranges from 0 (not coherent at all) to 1 (coherent). Higher
      C_V scores indicate more coherent topics; however, you shouldn&apos;t
      directly interpret the number. Rather, you should compare the C_V scores
      from multiple topic models to figure out which model produces the most
      coherent topics.
    </Text>
  );
}

function TopicEvaluationDescription() {
  return (
    <Stack>
      <TopicCoherenceExplanation />
      <Text>
        On the other hand,{' '}
        <Text fw="bold" span>
          topic diversity
        </Text>{' '}
        measures the overlap between the keywords of the discovered topics. A
        high topic diversity value (nearing 1) indicates that the words used to
        describe the topics have little overlap with one another and so they
        discriminate the topics more clearly. Topic diversity ranges from 0 to
        1, with 0 being least diverse and 1 being most diverse.
      </Text>
      <Text>
        Use this metric to figure out how much you can trust the topics
        discovered by the topic modeling algorithm. Although, note that these
        metrics are{' '}
        <Text span fw="bold">
          approximations
        </Text>{' '}
        of human judgement; what&apos;s important is whether you - as the user -
        can understand the topic or not.
      </Text>
    </Stack>
  );
}

interface TopicEvaluationControlsProps {
  isRunning: boolean;
}

export default function TopicEvaluationControls(
  props: TopicEvaluationControlsProps,
) {
  const { isRunning } = props;
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column!);
  const { mutateAsync: startEvaluation } = client.useMutation(
    'post',
    '/topic/{project_id}/evaluation/start',
    {
      onSuccess() {
        if (!column) return;
        const queryKey = client.queryOptions(
          'get',
          '/topic/{project_id}/evaluation/status',
          {
            params: {
              path: {
                project_id: project.id,
              },
              query: {
                column: column.name,
              },
            },
          },
        ).queryKey;
        queryClient.refetchQueries({
          queryKey: queryKey,
        });
      },
    },
  );

  return (
    <TaskControlsCard title="Topic Evaluation">
      <Stack>
        <TopicEvaluationDescription />
        <PromiseButton
          onClick={async () => {
            if (!column) return null;
            try {
              const res = await startEvaluation({
                params: {
                  path: {
                    project_id: project.id,
                  },
                  query: {
                    column: column.name,
                  },
                },
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
          loading={isRunning}
          disabled={!column}
          leftSection={<Exam weight="fill" />}
          className="max-w-md"
        >
          Begin Evaluation
        </PromiseButton>
      </Stack>
    </TaskControlsCard>
  );
}
