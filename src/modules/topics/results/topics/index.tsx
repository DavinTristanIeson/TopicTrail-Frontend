import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Alert, Select, Text } from '@mantine/core';
import React from 'react';
import { TopicVisualizationBubbleChartRenderer } from './bubble-chart';
import { TopicVisualizationScatterPlotRenderer } from './scatter-plot';
import { TopicBarChartRenderer, TopicWordsBarChartRenderer } from './bar-chart';
import {
  DocumentTopicsVisualizationDataProvider,
  SemanticTopicVisualizationDataProvider,
  TopicVisualizationDataProvider,
} from './data-providers';
import { TopicVisualizationWordCloudRenderer } from './word-cloud';
import { Info } from '@phosphor-icons/react';
import { useTopicAppState } from '../../app-state';

export enum TopicVisualizationMethodEnum {
  InterTopicRelationship = 'inter-topic-relationship',
  DocumentScatterPlot = 'document-scatter-plot',
  TopicsBarchart = 'topic-barchart',
  TopicWordsBarchart = 'topic-words-barchart',
  TopicWordsWordCloud = 'topic-words-word-cloud',
}

export const TOPIC_VISUALIZATION_METHOD_DICTIONARY = {
  [TopicVisualizationMethodEnum.InterTopicRelationship]: {
    label: 'Inter-Topic Relationship (Bubble Chart)',
    description:
      'Visualize the relationship between topics as a bubble chart. Topics with a higher frequency is represented with a larger bubble. Topics that have similar meanings are represented as bubbles that are close to each other.',
    value: TopicVisualizationMethodEnum.InterTopicRelationship,
  },
  [TopicVisualizationMethodEnum.DocumentScatterPlot]: {
    label: 'Document Semantic Space (Scatter-Plot)',
    description:
      'Visualize the meanings of the documents as a scatter plot. Documents with similar meanings are represented as points that are close to each other. Each document is colored according to its topic.',
    value: TopicVisualizationMethodEnum.DocumentScatterPlot,
  },
  [TopicVisualizationMethodEnum.TopicsBarchart]: {
    label: 'Topic Frequencies (Bar Chart)',
    description:
      'Visualize the frequencies of each topic as a bar chart. Each topic is represented with a bar, and the frequency of the topic is represented by the length of the bar.',
    value: TopicVisualizationMethodEnum.TopicsBarchart,
  },
  [TopicVisualizationMethodEnum.TopicWordsBarchart]: {
    label: 'Topic Words (Bar Chart)',
    description:
      'Visualize the topic words of each topic as a bar chart. Each word is represented with a bar, and the significance of the word (how the word differentiates this topic compared to the other topics) is represented by the length of the bar.',
    value: TopicVisualizationMethodEnum.TopicWordsBarchart,
  },
  [TopicVisualizationMethodEnum.TopicWordsWordCloud]: {
    label: 'Topic Words (Word Cloud)',
    description:
      'Visualize the topic words of each topic as a word cloud. The significance of the word (how the word differentiates this topic compared to the other topics) is represented by the size of the word.',
    value: TopicVisualizationMethodEnum.TopicWordsWordCloud,
  },
};

export default function TopicVisualizationRenderer() {
  const method = useTopicAppState(
    (store) => store.topics.topicVisualizationMethod,
  );
  const setMethod = useTopicAppState(
    (store) => store.topics.setTopicVisualizationMethod,
  );

  const renderOption = useDescriptionBasedRenderOption(
    TOPIC_VISUALIZATION_METHOD_DICTIONARY,
  );
  return (
    <>
      <Alert color="blue" icon={<Info />}>
        You can examine the topics through various visualization methods in this
        tab in order to help you get a quick overview of the topics. To find out
        the context of these topics, considering using the &quot;
        <Text fw={500} inherit span>
          Documents
        </Text>
        &quot; tab instead.
      </Alert>
      <Select
        data={Object.values(TOPIC_VISUALIZATION_METHOD_DICTIONARY)}
        label="Visualization method"
        renderOption={renderOption}
        value={method}
        onChange={setMethod as any}
        allowDeselect={false}
        maw={512}
      />
      {method === TopicVisualizationMethodEnum.InterTopicRelationship ? (
        <SemanticTopicVisualizationDataProvider>
          {TopicVisualizationBubbleChartRenderer}
        </SemanticTopicVisualizationDataProvider>
      ) : method === TopicVisualizationMethodEnum.DocumentScatterPlot ? (
        <DocumentTopicsVisualizationDataProvider>
          {TopicVisualizationScatterPlotRenderer}
        </DocumentTopicsVisualizationDataProvider>
      ) : method === TopicVisualizationMethodEnum.TopicWordsBarchart ? (
        <TopicVisualizationDataProvider>
          {TopicWordsBarChartRenderer}
        </TopicVisualizationDataProvider>
      ) : method === TopicVisualizationMethodEnum.TopicsBarchart ? (
        <TopicVisualizationDataProvider>
          {TopicBarChartRenderer}
        </TopicVisualizationDataProvider>
      ) : method === TopicVisualizationMethodEnum.TopicWordsWordCloud ? (
        <TopicVisualizationDataProvider>
          {TopicVisualizationWordCloudRenderer}
        </TopicVisualizationDataProvider>
      ) : null}
    </>
  );
}
