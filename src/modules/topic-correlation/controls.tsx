import React from 'react';
import { ProjectColumnSelectInput } from '../project/select-column-input';
import { Card, Text, Divider, Title, Slider, Input } from '@mantine/core';
import { AllTopicModelingResultContext } from '../topics/components/context';
import { TopicMultiSelectInput } from '../topics/components/select-topic-input';
import {
  useTopicCorrelationAppState,
  useTopicCorrelationAppStateTopicColumn,
} from './app-state';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';

function SelectTopicsForCorrelationMultiSelect() {
  const { topicModelingResult } = useTopicCorrelationAppStateTopicColumn();
  const topics = useTopicCorrelationAppState((store) => store.topics.state);
  const setTopics = useTopicCorrelationAppState(
    (store) => store.topics.handlers.setState,
  );
  const setTopicsDebounced = useDebouncedCallback(setTopics, 1000);

  const allTopics = topicModelingResult?.result?.topics ?? [];

  const [minFrequency, setMinFrequency] = React.useState(0);
  const [debouncedMinFrequency] = useDebouncedValue(minFrequency, 1000, {
    leading: false,
  });

  React.useEffect(() => {
    setTopicsDebounced((topics) => {
      return topics.filter((topic) => topic.frequency >= debouncedMinFrequency);
    });
  }, [debouncedMinFrequency, setTopicsDebounced]);

  if (!topicModelingResult?.result) return null;
  return (
    <>
      <Input.Wrapper
        label="Min. Frequency"
        description="Only show topics with at least this amount of rows. This helps filter out topics that are too small to be analyzed accurately with statistic tests."
      >
        <Slider
          value={minFrequency}
          min={0}
          max={Math.max(20, topicModelingResult.result.total_count)}
          label={`Min. Frequency: ${minFrequency} rows`}
          onChange={setMinFrequency}
        />
      </Input.Wrapper>
      <TopicMultiSelectInput
        data={allTopics}
        withOutlier={false}
        label="Topics"
        value={topics.map((topic) => topic.id)}
        onChange={setTopicsDebounced}
        description="Choose the topics that will be included in the analysis. Since there may be a lot of topics, you can filter the topics by their tags to reduce the topics you want to analyze to the most relevant ones."
      />
    </>
  );
}

export default function TopicCorrelationColumnControls() {
  const column = useTopicCorrelationAppState((store) => store.column);
  const setColumn = useTopicCorrelationAppState((store) => store.setColumn);

  const topicColumns = React.useContext(AllTopicModelingResultContext)
    .filter((topic) => !!topic.result)
    .map((topicModelingResult) => topicModelingResult.column);

  return (
    <Card
      withBorder
      p="lg"
      radius="lg"
      style={{ backgroundColor: 'white', borderLeft: '5px solid #7a84b9' }}
    >
      <Title order={2} c="brand">
        Topic Correlation Analysis
      </Title>
      <Divider my="sm" size="sm" color="#7a84b9" />
      <Text size="sm">
        Understanding the correlation between discovered topics and other
        dataset variables can provide valuable insights. This analysis helps in
        identifying patterns, trends, and potential influencing factors, which
        can be useful for decision-making and deeper data interpretation.
      </Text>
      <ProjectColumnSelectInput
        data={topicColumns}
        value={column?.name ?? null}
        onChange={setColumn}
        label="Column"
        description="Select a textual column whose topics will be used in the analysis. If you cannot find a textual column in the dropdown list, it is likely that you haven't run the topic modeling algorithm on that column yet."
      />
      <SelectTopicsForCorrelationMultiSelect />
    </Card>
  );
}
