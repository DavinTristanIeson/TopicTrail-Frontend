import { Stack } from '@mantine/core';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationTableWordFrequenciesModel } from '@/api/table';
import React from 'react';
import {
  useTopNWordsSlider,
  useVisualizationWordBarChartPlot,
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from './renderer';
import { useVisualizationSubdatasetsMultiSelect } from '../configuration/subdatasets';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationWeightedWordsConfigType,
  VisualizationWeightedWordsDisplayMode,
} from '../../configuration/weighted-words';
import { usePlotRendererHelperProps } from '../configuration';

export function VisualizationWordFrequencyWordCloud(
  props: BaseVisualizationComponentProps<
    VisualizationTableWordFrequenciesModel,
    object
  >,
) {
  const { data, item } = props;
  const {
    Component,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({ data, limit: 3 });

  const words = React.useMemo<VisualizationWordCloudItem[]>(() => {
    return viewedData.flatMap((subdataset) => {
      return subdataset.data.words.map((word) => {
        return {
          text: word[0],
          value: word[1],
          group: viewedData.length <= 1 ? undefined : subdataset.name,
        };
      });
    });
  }, [viewedData]);

  return (
    <Stack>
      {Component}
      <VisualizationWordCloudRenderer
        noDataPlaceholder="Choose at least one subdataset to include in the visualization"
        words={words}
        title={`Most Frequent Words of ${item.column}`}
        groups={subdatasetNames}
        valueLabel="Frequency"
      />
    </Stack>
  );
}

export function VisualizationWordFrequencyBarChart(
  props: BaseVisualizationComponentProps<
    VisualizationTableWordFrequenciesModel,
    object
  >,
) {
  const { data, item } = props;
  const { Component: TopNWordsSlider, topNWords } = useTopNWordsSlider();

  const plot = useVisualizationWordBarChartPlot({
    data: React.useMemo(() => {
      return data.map((subdataset) => {
        return {
          name: subdataset.name,
          data: subdataset.data.words,
        };
      });
    }, [data]),
    title: `Word Frequencies of "${item.column}"`,
    topNWords,
    valueLabel: 'Frequency',
  });

  const plotProps = usePlotRendererHelperProps(item);

  return (
    <Stack>
      {TopNWordsSlider}
      {plot && <PlotRenderer plot={plot} {...plotProps} scrollZoom={false} />}
    </Stack>
  );
}

export function VisualizationWordFrequencyComponent(
  props: BaseVisualizationComponentProps<
    VisualizationTableWordFrequenciesModel,
    VisualizationWeightedWordsConfigType
  >,
) {
  const { item } = props;
  if (item.config.display === VisualizationWeightedWordsDisplayMode.WordCloud) {
    return <VisualizationWordFrequencyWordCloud {...props} />;
  } else if (
    item.config.display === VisualizationWeightedWordsDisplayMode.BarChart
  ) {
    return <VisualizationWordFrequencyBarChart {...props} />;
  } else {
    throw new Error(
      `"${item.config.display}" is not a valid display mode for visualizing word frequencies.`,
    );
  }
}
