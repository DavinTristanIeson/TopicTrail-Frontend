import {
  MultiSelect,
  Group,
  Button,
  type SelectProps,
  type MultiSelectProps,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import React from 'react';
import { NamedData } from '../../types/base';
import { useSelectLeftRightButtons } from '@/components/visual/select';

interface UseVisualizationSubdatasetsMultiSelectReturn<T> {
  viewedData: NamedData<T>[];
  viewed: string[];
  Component: React.ReactNode;
  options: string[];
}

interface UseVisualizationSubdatasetsMultiSelectParams<T> {
  data: NamedData<T>[];
  limit: number | null;
  selectProps?: MultiSelectProps;
}

export function useVisualizationSubdatasetsMultiSelect<T>(
  props: UseVisualizationSubdatasetsMultiSelectParams<T>,
): UseVisualizationSubdatasetsMultiSelectReturn<T> {
  const { data, limit, selectProps } = props;
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
      label="Choose the subdatasets to visualize"
      {...selectProps}
      maxValues={limit ?? undefined}
      data={options}
      value={viewed}
      onChange={setViewed}
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

interface UseVisualizationSubdatasetSelectReturn<T> {
  viewedData: NamedData<T> | null;
  viewedIndex: number | null;
  viewed: string | null;
  selectProps: SelectProps;
}

interface UseVisualizationSubdatasetSelectParams<T> {
  data: NamedData<T>[];
  defaultValue?: string | null;
}

export function useVisualizationSubdatasetSelect<T>(
  props: UseVisualizationSubdatasetSelectParams<T>,
): UseVisualizationSubdatasetSelectReturn<T> {
  const { data, defaultValue } = props;
  const options = React.useMemo(
    () => data.map((subdataset) => subdataset.name),
    [data],
  );
  const [viewed, setViewed] = React.useState<string | null>(
    defaultValue === undefined ? (data[0]?.name ?? null) : defaultValue,
  );
  const inputContainer = useSelectLeftRightButtons({
    options,
    value: viewed,
    onChange: setViewed,
  });
  const selectProps: SelectProps = {
    data: options,
    value: viewed,
    onChange: setViewed,
    allowDeselect: false,
    required: true,
    inputContainer: inputContainer,
  };
  const viewedIndex = data.findIndex(
    (subdataset) => subdataset.name === viewed,
  );
  const viewedData =
    data.find((subdataset) => subdataset.name === viewed) ?? null;
  return {
    selectProps,
    viewedData,
    viewedIndex: viewedIndex === -1 ? null : viewedIndex,
    viewed,
  };
}
