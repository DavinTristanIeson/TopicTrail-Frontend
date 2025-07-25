import { BERTopicExperimentTrialResultModel } from '@/api/topic';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import React from 'react';
import {
  TopicBarChartRenderer,
  TopicWordsBarChartRenderer,
} from '@/modules/topics/results/topics/bar-chart';
import { Book, CheckCircle, Exam } from '@phosphor-icons/react';
import { TopicEvaluationResultRenderer } from '@/modules/topic-evaluation/result';
import { useTopicAppState } from '@/modules/topics/app-state';
import {
  TOPIC_VISUALIZATION_METHOD_DICTIONARY,
  TopicVisualizationMethodEnum,
} from '@/modules/topics/results/topics';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { TopicVisualizationWordCloudRenderer } from '@/modules/topics/results/topics/word-cloud';
import dayjs from 'dayjs';
import { ResultCard } from '@/components/visual/result-card';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import { showNotification } from '@mantine/notifications';
import { handleErrorFn } from '@/common/utils/error';
import { invalidateProjectDependencyQueries } from '@/api/project';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

enum TopicModelExperimentResultModalDisplay {
  Topics = 'topics',
  Evaluation = 'topics_evaluation',
}

function TopicModelExperimentResultTopicsRenderer(
  props: BERTopicExperimentTrialResultModel,
) {
  const { evaluation } = props;
  const column = useTopicAppState((store) => store.column!);

  const [method, setMethod] = React.useState(
    TopicVisualizationMethodEnum.TopicsBarchart,
  );
  const renderOption = useDescriptionBasedRenderOption(
    TOPIC_VISUALIZATION_METHOD_DICTIONARY,
  );
  const topics = React.useMemo(() => {
    return (
      evaluation?.topics.map((topicEvaluation) => topicEvaluation.topic) ?? []
    );
  }, [evaluation?.topics]);

  const outlierCount = evaluation?.outlier_count;

  return (
    <Stack>
      <Select
        data={[
          TopicVisualizationMethodEnum.TopicWordsBarchart,
          TopicVisualizationMethodEnum.TopicWordsWordCloud,
          TopicVisualizationMethodEnum.TopicsBarchart,
        ].map((value) => TOPIC_VISUALIZATION_METHOD_DICTIONARY[value])}
        label="Visualization method"
        renderOption={renderOption}
        value={method}
        onChange={setMethod as any}
        allowDeselect={false}
        maw={512}
      />
      {method === TopicVisualizationMethodEnum.TopicWordsBarchart ? (
        <TopicWordsBarChartRenderer
          data={topics}
          column={column}
          outlierCount={outlierCount}
        />
      ) : method === TopicVisualizationMethodEnum.TopicsBarchart ? (
        <TopicBarChartRenderer data={topics} column={column} />
      ) : method === TopicVisualizationMethodEnum.TopicWordsWordCloud ? (
        <TopicVisualizationWordCloudRenderer data={topics} column={column} />
      ) : null}
    </Stack>
  );
}

function TopicModelExperimentResultTopicsModalTabs(
  trial: BERTopicExperimentTrialResultModel,
) {
  const [display, setDisplay] = React.useState(
    TopicModelExperimentResultModalDisplay.Topics,
  );
  const column = useTopicAppState((store) => store.column);

  if (!trial.evaluation) return null;

  return (
    <Tabs
      value={display}
      onChange={
        setDisplay as React.Dispatch<React.SetStateAction<string | null>>
      }
      allowTabDeactivation={false}
    >
      <Tabs.List>
        <Tabs.Tab
          value={TopicModelExperimentResultModalDisplay.Topics}
          leftSection={<Book />}
        >
          Topics
        </Tabs.Tab>
        <Tabs.Tab
          value={TopicModelExperimentResultModalDisplay.Evaluation}
          leftSection={<Exam />}
        >
          Evaluation Results
        </Tabs.Tab>
      </Tabs.List>
      <div className="pt-5">
        <DefaultErrorViewBoundary>
          {display === TopicModelExperimentResultModalDisplay.Topics ? (
            <TopicModelExperimentResultTopicsRenderer {...trial} />
          ) : display === TopicModelExperimentResultModalDisplay.Evaluation ? (
            <TopicEvaluationResultRenderer
              {...trial.evaluation!}
              column={column?.name ?? 'Column'}
            />
          ) : undefined}
        </DefaultErrorViewBoundary>
      </div>
    </Tabs>
  );
}

const TopicModelExperimentResultTopicsModal =
  React.forwardRef<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null>(
    function TopicModelExperimentResultTopicsModal(props, ref) {
      const [trial, { close }] = useParametrizedDisclosureTrigger(ref);
      const project = React.useContext(ProjectContext);
      const column = useTopicAppState((store) => store.column!);
      const { replace } = useRouter();
      const { mutateAsync: applyTopicModelHyperparameter, isPending } =
        client.useMutation(
          'post',
          '/topic/{project_id}/apply-topic-model-hyperparameter',
        );

      return (
        <Modal opened={!!trial} onClose={close} fullScreen>
          {trial && (
            <Stack gap={32}>
              <Group justify="space-between">
                <Title
                  order={2}
                  fw={500}
                  c="brand"
                >{`Trial ${trial.trial_number}`}</Title>
                <Text c="gray">
                  {dayjs(trial.timestamp).format('DD MMMM YYYY, HH:mm:ss')}
                </Text>
              </Group>
              <Stack>
                <Text fw={500}>Hyperparameters</Text>
                <Group wrap="wrap">
                  {trial.candidate.min_topic_size && (
                    <ResultCard
                      label="Min. Topic Size"
                      value={trial.candidate.min_topic_size}
                    />
                  )}
                  {trial.candidate.topic_confidence_threshold && (
                    <ResultCard
                      label="Topic Confidence Threshold"
                      value={trial.candidate.topic_confidence_threshold}
                    />
                  )}
                </Group>
                <Button
                  loading={isPending}
                  className="max-w-md"
                  leftSection={<CheckCircle />}
                  onClick={handleErrorFn(async () => {
                    const res = await applyTopicModelHyperparameter({
                      params: {
                        path: {
                          project_id: project.id,
                        },
                        query: {
                          column: column.name,
                        },
                      },
                      body: trial.candidate,
                    });
                    if (res.message) {
                      showNotification({
                        message: res.message,
                        color: 'green',
                      });
                    }
                    close();
                    replace({
                      pathname: NavigationRoutes.ProjectTopics,
                      query: {
                        id: project.id,
                      },
                    });
                    invalidateProjectDependencyQueries(project.id);
                  })}
                >
                  Use these hyperparameters
                </Button>
              </Stack>
              {trial.error && (
                <Alert color="red" title="This trial has failed">
                  An unexpected error has occurred that caused this trial to
                  fail.
                </Alert>
              )}
              {trial.evaluation && (
                <TopicModelExperimentResultTopicsModalTabs {...trial} />
              )}
            </Stack>
          )}
        </Modal>
      );
    },
  );
export default TopicModelExperimentResultTopicsModal;
