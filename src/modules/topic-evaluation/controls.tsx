import { Stack, Text } from '@mantine/core';
import { ProjectColumnSelectInput } from '../project/select-column-input';
import React from 'react';
import { useTopicEvaluationAppState } from './app-state';
import { AllTopicModelingResultContext } from '../topics/components/context';
import PromiseButton from '@/components/standard/button/promise';
import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';
import { ProjectContext } from '../project/context';
import { handleError } from '@/common/utils/error';
import { Exam } from '@phosphor-icons/react';
import { showNotification } from '@mantine/notifications';
import { TaskControlsCard } from '../task/controls';

function TopicEvaluationDescription() {
  return (
    <Stack>
      <Text>
        <Text fw="bold" span>
          Topic coherence
        </Text>{' '}
        is a quantitative measure of the interpretability of a topic. They
        assess how well the words that make up a topic is supported by the
        actual documents. The metric of topic coherence used in this evaluation
        is C_V scoring which ranges from 0 (not coherent at all) to 1
        (coherent). Generally, C_v scores higher than 0.55 can be considered
        acceptably coherent while scores less than 0.4 is low, but this varies
        from dataset to dataset, and also from the number of topics. Higher C_v
        scores indicate more coherent topics. If you keep on getting low C_V
        scores, consider setting a maximum number of topics to constrain the
        number of topics. The low scores may have been caused by the small
        topics discovered by the topic modeling algorithm.
      </Text>
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

export default function TopicEvaluationControls() {
  const project = React.useContext(ProjectContext);
  const column = useTopicEvaluationAppState((store) => store.column);
  const setColumn = useTopicEvaluationAppState((store) => store.setColumn);
  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  const topicColumns = allTopicModelingResults
    .filter((topic) => !!topic.result)
    .map((topicModelingResult) => topicModelingResult.column);
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
                column: column?.name,
              },
            },
          },
        ).queryKey;
        queryClient.removeQueries({
          queryKey: queryKey,
        });
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
        <ProjectColumnSelectInput
          data={topicColumns}
          value={column?.name ?? null}
          onChange={setColumn as any}
          allowDeselect={false}
          label="Column"
          description="Select a textual column whose topics will be evaluated. If you cannot find a textual column in the dropdown list, it is likely that you haven't run the topic modeling algorithm on that column yet."
        />
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
