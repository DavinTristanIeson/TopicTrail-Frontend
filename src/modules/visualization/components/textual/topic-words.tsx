import React from 'react';
import { Stack } from '@mantine/core';
import { getTopicLabel, TopicModel } from '@/api/topic';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import {
  useTopNWordsSlider,
  useVisualizationWordBarChartPlot,
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from '@/modules/visualization/components/textual/renderer';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import { TopicSelectInput } from '@/modules/topics/components/select-topic-input';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { useVisualizationSubdatasetsMultiSelect } from '../configuration/subdatasets';
import { DashboardItemModel } from '@/api/userdata';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
} from '../configuration';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationWeightedWordsConfigType,
  VisualizationWeightedWordsDisplayMode,
} from '../../configuration/weighted-words';

function useVisualizationTopicSelectInput(
  data: NamedData<TopicModel[]>[],
  item: DashboardItemModel,
) {
  const topicModelingResult = useTopicModelingResultOfColumn(item.column);
  const topics = React.useMemo(() => {
    const topicIds = data.flatMap((subdataset) =>
      subdataset.data.map((topic) => topic.id),
    );
    return (
      topicModelingResult?.result?.topics.filter((topic) =>
        topicIds.includes(topic.id),
      ) ?? []
    );
  }, [data, topicModelingResult?.result?.topics]);

  const [topic, setTopic] = React.useState<TopicModel | null>(
    topics?.[0] ?? null,
  );

  const inputContainer = useSelectLeftRightButtons({
    options: topics,
    onChange: setTopic,
    value: topic,
  });

  const Component = (
    <TopicSelectInput
      data={topics}
      value={topic?.id}
      withOutlier={false}
      onChange={(topic) => setTopic(topic)}
      label="Topic"
      className="w-full"
      description="Choose a topic to view its topic words as a word cloud."
      allowDeselect={false}
      inputContainer={inputContainer}
    />
  );

  const topicsPerData = React.useMemo(() => {
    return data
      .map((entry) => {
        if (!topic) return undefined;
        const thisTopic = entry.data.find(
          (dataTopic) => dataTopic.id === topic.id,
        );
        if (!thisTopic) return undefined;
        return { name: entry.name, data: thisTopic };
      })
      .filter(Boolean) as NamedData<TopicModel>[];
  }, [data, topic]);

  return { Component, topic, topicsPerData };
}

export function VisualizationTopicWordsWordCloud(
  props: BaseVisualizationComponentProps<TopicModel[], object>,
) {
  const { data, item } = props;

  const {
    Component: SubdatasetsMultiSelect,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({ data, limit: 3 });
  const {
    Component: TopicSelectInput,
    topic,
    topicsPerData,
  } = useVisualizationTopicSelectInput(viewedData, item);

  const topicWords = React.useMemo(() => {
    if (!topic) return [];
    return topicsPerData.flatMap((topicData) => {
      return (
        topicData.data.words.map((word) => {
          return {
            text: word[0],
            value: word[1],
            group: viewedData.length <= 1 ? undefined : topicData.name,
          } as VisualizationWordCloudItem;
        }) ?? []
      );
    });
  }, [topic, topicsPerData, viewedData.length]);

  return (
    <Stack>
      <PlotInlineConfiguration>
        {SubdatasetsMultiSelect}
        {TopicSelectInput}
      </PlotInlineConfiguration>
      <VisualizationWordCloudRenderer
        words={topicWords}
        title={
          topic
            ? `Tuned Topic Words of ${getTopicLabel(topic!)}`
            : 'View Topic Words'
        }
        groups={subdatasetNames}
        valueLabel="C-TF-IDF Score"
        noDataPlaceholder="Choose a topic to get started"
      />
    </Stack>
  );
}

export function VisualizationTopicWordsBarChart(
  props: BaseVisualizationComponentProps<TopicModel[], object>,
) {
  const { data, item } = props;
  const { Component: TopNWordsSlider, topNWords } = useTopNWordsSlider();
  const {
    Component: TopicSelectInput,
    topic,
    topicsPerData,
  } = useVisualizationTopicSelectInput(data, item);

  const plot = useVisualizationWordBarChartPlot({
    data: React.useMemo(() => {
      return topicsPerData.map((topic) => ({
        name: topic.name,
        data: topic.data.words,
      }));
    }, [topicsPerData]),
    title: topic ? `Topic Words of "${getTopicLabel(topic)}"` : 'Topic Words',
    topNWords,
    valueLabel: 'C-TF-IDF',
  });

  const plotProps = usePlotRendererHelperProps(item);

  return (
    <Stack>
      {TopicSelectInput}
      {TopNWordsSlider}
      {plot && <PlotRenderer plot={plot} {...plotProps} scrollZoom={false} />}
    </Stack>
  );
}

export function VisualizationTopicWordsComponent(
  props: BaseVisualizationComponentProps<
    TopicModel[],
    VisualizationWeightedWordsConfigType
  >,
) {
  const { item } = props;
  if (item.config.display === VisualizationWeightedWordsDisplayMode.WordCloud) {
    return <VisualizationTopicWordsWordCloud {...props} />;
  } else if (
    item.config.display === VisualizationWeightedWordsDisplayMode.BarChart
  ) {
    return <VisualizationTopicWordsBarChart {...props} />;
  } else {
    throw new Error(
      `"${item.config.display}" is not a valid display mode for visualizing topic words.`,
    );
  }
}
