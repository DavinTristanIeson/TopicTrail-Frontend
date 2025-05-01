import React from 'react';
import { Stack } from '@mantine/core';
import { TopicModel } from '@/api/topic';
import {
  useTopNWordsSlider,
  useVisualizationWordBarChartPlot,
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from '@/modules/visualization/components/textual/renderer';
import { BaseVisualizationComponentProps } from '../../types/base';
import { useVisualizationSubdatasetsMultiSelect } from '../configuration/subdatasets';
import {
  VisualizationWeightedWordsConfigType,
  VisualizationWeightedWordsDisplayMode,
} from '../../configuration/weighted-words';
import PlotRenderer from '@/components/widgets/plotly';
import { usePlotRendererHelperProps } from '../configuration';

export function VisualizationCompareSubdatasetWordsWordCloud(
  props: BaseVisualizationComponentProps<TopicModel, object>,
) {
  const { data, item } = props;
  const {
    Component,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({
    data,
    limit: 3,
  });

  const words = React.useMemo(() => {
    return viewedData.flatMap((subdataset) => {
      return (
        subdataset.data.words.map((word) => {
          return {
            text: word[0],
            value: word[1],
            group: subdataset.name,
          } as VisualizationWordCloudItem;
        }) ?? []
      );
    });
  }, [viewedData]);

  return (
    <Stack>
      {Component}
      <VisualizationWordCloudRenderer
        words={words}
        title={`Word Comparison of ${item.column}`}
        groups={subdatasetNames}
        noDataPlaceholder="Choose a subdataset to get started"
        valueLabel="C-TF-IDF Score"
      />
    </Stack>
  );
}

export function VisualizationCompareSubdatasetWordsBarChart(
  props: BaseVisualizationComponentProps<TopicModel, object>,
) {
  const { data, item } = props;
  const { Component: TopNWordsSlider, topNWords } = useTopNWordsSlider();

  const plot = useVisualizationWordBarChartPlot({
    data: React.useMemo(() => {
      return data.map((subdataset) => ({
        name: subdataset.name,
        data: subdataset.data.words,
      }));
    }, [data]),
    title: `Most Significant Words of the Subdatasets of ${item.column}`,
    topNWords,
    valueLabel: 'C-TF-IDF',
  });

  const plotProps = usePlotRendererHelperProps(item);

  return (
    <Stack>
      {TopNWordsSlider}
      {plot && <PlotRenderer plot={plot} {...plotProps} scrollZoom={false} />}
    </Stack>
  );
}

export function VisualizationCompareSubdatasetWords(
  props: BaseVisualizationComponentProps<
    TopicModel,
    VisualizationWeightedWordsConfigType
  >,
) {
  const { item } = props;
  if (item.config.display === VisualizationWeightedWordsDisplayMode.WordCloud) {
    return <VisualizationCompareSubdatasetWordsWordCloud {...props} />;
  } else if (
    item.config.display === VisualizationWeightedWordsDisplayMode.BarChart
  ) {
    return <VisualizationCompareSubdatasetWordsBarChart {...props} />;
  } else {
    throw new Error(
      `"${item.config.display}" is not a valid display mode for comparing subdataset words.`,
    );
  }
}
