import { BERTopicExperimentTrialResultModel, TopicModel } from '@/api/topic';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { Modal, Select, Stack, Tabs } from '@mantine/core';
import React from 'react';
import { TopicModelExperimentResultListItem } from './list-item';
import {
  TopicBarChartRenderer,
  TopicWordsBarChartRenderer,
} from '@/modules/topics/results/topics/bar-chart';
import { VisualizationTopicWordsComponent } from '@/modules/visualization/components/textual/topic-words';
import { VisualizationWeightedWordsDisplayMode } from '@/modules/visualization/configuration/weighted-words';
import { Book, Exam } from '@phosphor-icons/react';
import { TopicEvaluationResultRenderer } from '@/modules/topic-evaluation/result';
import { useTopicAppState } from '@/modules/topics/app-state';
import {
  TOPIC_VISUALIZATION_METHOD_DICTIONARY,
  TopicVisualizationMethodEnum,
} from '@/modules/topics/results/topics';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { TopicVisualizationWordCloudRenderer } from '@/modules/topics/results/topics/word-cloud';

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
      evaluation?.coherence_v_per_topic.map((coherence) => coherence.topic) ??
      []
    );
  }, []);

  return (
    <Stack>
      <Select
        data={[
          TopicVisualizationMethodEnum.TopicWordsBarchart,
          TopicVisualizationMethodEnum.TopicWordsWordCloud,
          TopicVisualizationMethodEnum.TopicsBarchart,
        ]}
        label="Visualization method"
        renderOption={renderOption}
        value={method}
        onChange={setMethod as any}
        allowDeselect={false}
        maw={512}
      />
      {method === TopicVisualizationMethodEnum.TopicWordsBarchart ? (
        <TopicWordsBarChartRenderer data={topics} column={column} />
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
    VisualizationWeightedWordsDisplayMode.WordCloud,
  );
  const column = useTopicAppState((store) => store.column);

  if (trial.evaluation) return null;

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
      <Tabs.Panel value={TopicModelExperimentResultModalDisplay.Topics}>
        <TopicModelExperimentResultTopicsRenderer {...trial} />
      </Tabs.Panel>
      <Tabs.Panel value={TopicModelExperimentResultModalDisplay.Evaluation}>
        <TopicEvaluationResultRenderer
          {...trial.evaluation!}
          column={column?.name ?? 'Column'}
        />
      </Tabs.Panel>
    </Tabs>
  );
}

const TopicModelExperimentResultTopicsModal =
  React.forwardRef<ParametrizedDisclosureTrigger<BERTopicExperimentTrialResultModel> | null>(
    function TopicModelExperimentResultTopicsModal(props, ref) {
      const [trial, { close }] = useParametrizedDisclosureTrigger(ref);

      return (
        <Modal opened={!!trial} onClose={close}>
          {trial && (
            <>
              <TopicModelExperimentResultListItem
                trialRemote={null}
                trial={{
                  ...trial,
                  evaluation: null,
                }}
              />
              {trial.evaluation && (
                <TopicModelExperimentResultTopicsModalTabs {...trial} />
              )}
            </>
          )}
        </Modal>
      );
    },
  );
export default TopicModelExperimentResultTopicsModal;
