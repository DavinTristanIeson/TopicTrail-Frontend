import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Select } from '@mantine/core';
import React from 'react';
import { TopicVisualizationBubbleChartRenderer } from './bubble-chart';
import { TopicVisualizationScatterPlotRenderer } from './scatter-plot';
import { TopicBarChartRenderer, TopicWordsBarChartRenderer } from './bar-chart';
import {
  DocumentTopicsVisualizationDataProvider,
  TopicVisualizationDataProvider,
} from './data-providers';

enum TopicVisualizationMethod {
  InterTopicRelationship = 'inter-topic-relationship',
  DocumentScatterPlot = 'document-scatter-plot',
  TopicsBarchart = 'topic-barchart',
  TopicWordsBarchart = 'topic-words-barchart',
  TopicWordsWordCloud = 'topic-words-word-cloud',
}

const TOPIC_VISUALIZATION_METHOD_DICTIONARY = {
  [TopicVisualizationMethod.InterTopicRelationship]: {
    label: 'Inter-Topic Relationship (Bubble Chart)',
    description:
      'Visualize the relationship between topics as a bubble chart. Topics with a higher frequency is represented with a larger bubble. Topics that have similar meanings are represented as bubbles that are close to each other.',
    value: TopicVisualizationMethod.InterTopicRelationship,
  },
  [TopicVisualizationMethod.DocumentScatterPlot]: {
    label: 'Document Semantic Space (Scatter-Plot)',
    description:
      'Visualize the meanings of the documents as a scatter plot. Documents with similar meanings are represented as points that are close to each other. Each document is colored according to its topic.',
    value: TopicVisualizationMethod.DocumentScatterPlot,
  },
  [TopicVisualizationMethod.TopicsBarchart]: {
    label: 'Topic Frequencies (Bar Chart)',
    description:
      'Visualize the frequencies of each topic as a bar chart. Each topic is represented with a bar, and the frequency of the topic is represented by the length of the bar.',
    value: TopicVisualizationMethod.TopicsBarchart,
  },
  [TopicVisualizationMethod.TopicWordsBarchart]: {
    label: 'Topic Words (Bar Chart)',
    description:
      'Visualize the topic words of each topic as a bar chart. Each word is represented with a bar, and the significance of the word (how the word differentiates this topic compared to the other topics) is represented by the length of the bar.',
    value: TopicVisualizationMethod.TopicWordsBarchart,
  },
  [TopicVisualizationMethod.TopicWordsWordCloud]: {
    label: 'Topic Words (Word Cloud)',
    description:
      'Visualize the topic words of each topic as a word cloud. The significance of the word (how the word differentiates this topic compared to the other topics) is represented by the size of the word.',
    value: TopicVisualizationMethod.TopicWordsWordCloud,
  },
};

export default function TopicVisualizationRenderer() {
  const [method, setMethod] = React.useState<string | null>(
    TopicVisualizationMethod.InterTopicRelationship,
  );
  const renderOption = useDescriptionBasedRenderOption(
    TOPIC_VISUALIZATION_METHOD_DICTIONARY,
  );
  return (
    <>
      <Select
        data={Object.values(TOPIC_VISUALIZATION_METHOD_DICTIONARY)}
        label="Visualization method"
        renderOption={renderOption}
        value={method}
        onChange={setMethod}
        allowDeselect={false}
        maw={512}
      />
      {method === TopicVisualizationMethod.InterTopicRelationship ? (
        <TopicVisualizationDataProvider>
          {TopicVisualizationBubbleChartRenderer}
        </TopicVisualizationDataProvider>
      ) : method === TopicVisualizationMethod.DocumentScatterPlot ? (
        <DocumentTopicsVisualizationDataProvider>
          {TopicVisualizationScatterPlotRenderer}
        </DocumentTopicsVisualizationDataProvider>
      ) : method === TopicVisualizationMethod.TopicWordsBarchart ? (
        <TopicVisualizationDataProvider>
          {TopicWordsBarChartRenderer}
        </TopicVisualizationDataProvider>
      ) : method === TopicVisualizationMethod.TopicsBarchart ? (
        <TopicVisualizationDataProvider>
          {TopicBarChartRenderer}
        </TopicVisualizationDataProvider>
      ) : null}
    </>
  );
}
