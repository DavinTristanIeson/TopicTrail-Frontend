import { Stack } from '@mantine/core';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationWordsModel } from '@/api/table';
import React from 'react';
import {
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from './renderer';
import { useVisualizationSubdatasetsMultiSelect } from '../configuration/subdatasets';

export function VisualizationWordFrequencyComponent(
  props: BaseVisualizationComponentProps<VisualizationWordsModel, object>,
) {
  const { data, item } = props;
  const {
    Component,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({ data });

  const words = React.useMemo<VisualizationWordCloudItem[]>(() => {
    return viewedData.flatMap((subdataset) => {
      return subdataset.data.words.map((word) => {
        return {
          text: word.word,
          value: word.size,
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
      />
    </Stack>
  );
}
