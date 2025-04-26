import { MultiSelect, Group, Button } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import React from 'react';
import { NamedData } from '../../types/base';

interface UseVisualizationSubdatasetsMultiSelectReturn<T> {
  viewedData: NamedData<T>[];
  viewed: string[];
  Component: React.ReactNode;
  options: string[];
}

interface UseVisualizationSubdatasetsMultiSelectParams<T> {
  data: NamedData<T>[];
  limit: number | null;
}

export function useVisualizationSubdatasetsMultiSelect<T>(
  props: UseVisualizationSubdatasetsMultiSelectParams<T>,
): UseVisualizationSubdatasetsMultiSelectReturn<T> {
  const { data, limit } = props;
  const options = React.useMemo(
    () => data.map((subdataset) => subdataset.name),
    [data],
  );
  const [viewed, setViewed] = React.useState<string[]>(() =>
    limit != null ? options.slice(0, limit) : options,
  );

  const withSelectAll = limit == null || limit >= data.length;

  const Component = data.length > 1 && (
    <MultiSelect
      data={options}
      value={viewed}
      onChange={setViewed}
      label="Choose the Subdatasets to Visualize"
      maxValues={limit ?? undefined}
      inputContainer={
        withSelectAll
          ? (children) => (
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
                  variant="subtle"
                >
                  {viewed.length === data.length ? 'Deselect' : 'Select'} All
                </Button>
              </Group>
            )
          : undefined
      }
    />
  );

  const [actuallyViewed] = useDebouncedValue(viewed, 800, { leading: false });
  const viewedData = React.useMemo(() => {
    return data.filter((subdataset) =>
      actuallyViewed.includes(subdataset.name),
    );
  }, [actuallyViewed, data]);

  return { viewed: actuallyViewed, Component, viewedData, options };
}
