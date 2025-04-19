import { Button, Group, MultiSelect, Stack } from '@mantine/core';
import { BaseVisualizationComponentProps } from '../../types/base';
import { VisualizationWordsModel } from '@/api/table';
import React from 'react';
import {
  VisualizationWordCloudItem,
  VisualizationWordCloudRenderer,
} from './renderer';

export function VisualizationWordFrequencyComponent(
  props: BaseVisualizationComponentProps<VisualizationWordsModel, object>,
) {
  const { data, item } = props;
  const options = React.useMemo(
    () => data.map((subdataset) => subdataset.name),
    [data],
  );
  const [viewed, setViewed] = React.useState<string[]>(options);

  const words = React.useMemo<VisualizationWordCloudItem[]>(() => {
    return data
      .filter((subdataset) => viewed.includes(subdataset.name))
      .flatMap((subdataset) => {
        return subdataset.data.words.map((word) => {
          return {
            text: word.word,
            value: word.size,
            group: viewed.length <= 1 ? undefined : subdataset.name,
          };
        });
      });
  }, [data, viewed]);
  return (
    <Stack>
      <MultiSelect
        data={options}
        value={viewed}
        onChange={setViewed}
        label="Choose the Subdatasets to Visualize"
        inputContainer={(children) => (
          <Group>
            <div className="flex-1">{children}</div>
            <Button
              onClick={() => {
                if (viewed.length === data.length) {
                  setViewed([]);
                } else {
                  setViewed(data.map((subdataset) => subdataset.name));
                }
              }}
            >
              {viewed.length === data.length ? 'Deselect' : 'Select'} All
            </Button>
          </Group>
        )}
      />
      <VisualizationWordCloudRenderer
        noDataPlaceholder="Choose at least one subdataset to include in the visualization"
        words={words}
        title={`Most Frequent Words of ${item.column}`}
        groups={data.map((subdataset) => subdataset.name)}
      />
    </Stack>
  );
}
