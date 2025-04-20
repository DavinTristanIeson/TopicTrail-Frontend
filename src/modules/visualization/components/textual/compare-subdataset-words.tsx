import React from 'react';
import { Stack } from '@mantine/core';
import { TopicModel } from '@/api/topic';
import {
  useVisualizationSubdatasetsMultiSelect,
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from '@/modules/visualization/components/textual/renderer';
import { BaseVisualizationComponentProps } from '../../types/base';

export function VisualizationCompareSubdatasetWords(
  props: BaseVisualizationComponentProps<TopicModel, object>,
) {
  const { data, item } = props;
  const {
    Component,
    viewedData,
    options: subdatasetNames,
  } = useVisualizationSubdatasetsMultiSelect({ data, withSelectAll: true });

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
      />
    </Stack>
  );
}
