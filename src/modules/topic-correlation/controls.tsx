import React from 'react';
import { ProjectColumnSelectInput } from '../project/select-column-input';
import {
  Card,
  Text,
  Divider,
  Title,
  Slider,
  Input,
  Stack,
  Button,
} from '@mantine/core';
import { AllTopicModelingResultContext } from '../topics/components/context';
import {
  useCheckTopicCorrelationTargetVisibility,
  useTopicCorrelationAppState,
  useTopicCorrelationAppStateTopicColumn,
} from './app-state';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { ListSkeleton } from '@/components/visual/loading';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { sum } from 'lodash-es';

const SortableTopicCorrelationTopicsDndContext = dynamic(
  () => import('./sortable-correlation-targets-context'),
  {
    loading: () => <ListSkeleton />,
  },
);

function TopicsManagerMinFrequencySlider() {
  const { topicModelingResult } = useTopicCorrelationAppStateTopicColumn();
  const setVisibility = useTopicCorrelationAppState(
    (store) => store.setVisibility,
  );
  const setVisibilityDebounced = useDebouncedCallback(setVisibility, 1000);

  const allTopics = topicModelingResult?.result?.topics;

  const [minFrequency, setMinFrequency] = React.useState(0);
  const [debouncedMinFrequency] = useDebouncedValue(minFrequency, 1000, {
    leading: false,
  });

  React.useEffect(() => {
    setVisibilityDebounced(() => {
      return new Map(
        (allTopics ?? []).map((topic) => [
          topic.id,
          topic.frequency >= debouncedMinFrequency,
        ]),
      );
    });
  }, [allTopics, debouncedMinFrequency, setVisibilityDebounced]);

  const maxFrequency = React.useMemo(() => {
    if (!allTopics) return 20;
    return Math.max(20, sum(allTopics?.map((topic) => topic.frequency)));
  }, [allTopics]);

  if (!topicModelingResult?.result) return null;
  return (
    <Input.Wrapper
      label="Min. Frequency"
      description="Only show topics with at least this amount of rows. This helps filter out topics that are too small to be analyzed accurately with statistic tests."
    >
      <Slider
        value={minFrequency}
        min={0}
        max={maxFrequency}
        label={`Min. Frequency: ${minFrequency} rows`}
        onChange={setMinFrequency}
      />
    </Input.Wrapper>
  );
}

function TopicsManagerShowHideAllButton() {
  const correlationTargets = useTopicCorrelationAppState(
    (store) => store.topics,
  );
  const setCorrelationTargets = useTopicCorrelationAppState(
    (store) => store.setTopics,
  );
  const { areAllTopicsVisible } = useCheckTopicCorrelationTargetVisibility();
  const isAll = areAllTopicsVisible(correlationTargets ?? []);

  if (!correlationTargets) {
    return null;
  }
  return (
    <Button
      variant="outline"
      color={isAll ? 'red' : 'green'}
      leftSection={isAll ? <EyeSlash /> : <Eye />}
      onClick={() => {
        setCorrelationTargets((targets) => {
          return (
            targets?.map((topic) => {
              return {
                ...topic,
                visible: !isAll,
              };
            }) ?? null
          );
        });
      }}
    >
      {isAll ? 'Hide' : 'Show'} All
    </Button>
  );
}

function SortableTopicCorrelationTopicsSafeguard() {
  const correlationTargets = useTopicCorrelationAppState(
    (store) => store.topics,
  );
  if (correlationTargets == null || correlationTargets.length === 0) return;
  return <SortableTopicCorrelationTopicsDndContext />;
}

export default function TopicCorrelationTopicsManager() {
  const column = useTopicCorrelationAppState((store) => store.column);
  const setColumn = useTopicCorrelationAppState((store) => store.setColumn);
  const setCorrelationTargets = useTopicCorrelationAppState(
    (store) => store.setTopics,
  );
  const setVisibility = useTopicCorrelationAppState(
    (store) => store.setVisibility,
  );

  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  const topicColumns = allTopicModelingResults
    .filter((topic) => !!topic.result)
    .map((topicModelingResult) => topicModelingResult.column);

  return (
    <Stack>
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
        <Stack>
          <Text size="sm">
            Understanding the correlation between discovered topics and other
            dataset variables can provide valuable insights. This analysis helps
            in identifying patterns, trends, and potential influencing factors,
            which can be useful for decision-making and deeper data
            interpretation.
          </Text>
          <ProjectColumnSelectInput
            data={topicColumns}
            value={column?.name ?? null}
            onChange={(column) => {
              if (!column) {
                setCorrelationTargets(null);
                setColumn(null);
              } else {
                const topicModelingResult = allTopicModelingResults.find(
                  (tmResult) => tmResult.column.name === column.name,
                );
                if (!topicModelingResult?.result) {
                  return;
                }
                const topics = topicModelingResult.result.topics;
                setColumn(column);
                setCorrelationTargets(topics);
                setVisibility(new Map(topics.map((topic) => [topic.id, true])));
              }
            }}
            label="Column"
            description="Select a textual column whose topics will be used in the analysis. If you cannot find a textual column in the dropdown list, it is likely that you haven't run the topic modeling algorithm on that column yet."
          />
          <TopicsManagerMinFrequencySlider />
          <TopicsManagerShowHideAllButton />
        </Stack>
      </Card>
      <SortableTopicCorrelationTopicsSafeguard />
    </Stack>
  );
}
