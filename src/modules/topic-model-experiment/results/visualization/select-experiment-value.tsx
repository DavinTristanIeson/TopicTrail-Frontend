import { BERTopicExperimentResultModel } from '@/api/topic';
import React from 'react';
import {
  useTopicModelExperimentValueOptions,
  TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY,
} from '../component/select';
import { Select } from '@mantine/core';
import { useTopicModelExperimentAppState } from '../../app-state';

interface UseTopicModelExperimentValueTypePlotProps {
  data: BERTopicExperimentResultModel;
}

export function useTopicModelExperimentValueTypePlot(
  props: UseTopicModelExperimentValueTypePlotProps,
) {
  const { data } = props;

  const xType = useTopicModelExperimentAppState((store) => store.summary.xType);
  const setXType = useTopicModelExperimentAppState(
    (store) => store.summary.setXType,
  );
  const yType = useTopicModelExperimentAppState((store) => store.summary.yType);
  const setYType = useTopicModelExperimentAppState(
    (store) => store.summary.setYType,
  );
  const colorType = useTopicModelExperimentAppState(
    (store) => store.summary.colorType,
  );
  const setColorType = useTopicModelExperimentAppState(
    (store) => store.summary.setColorType,
  );

  const options = useTopicModelExperimentValueOptions({
    constraint: data.constraint,
  });

  const SelectX = (
    <Select
      value={xType}
      onChange={setXType as any}
      data={options}
      label="Data for X"
      description="Select the data that will be used for the X axis."
      searchable={false}
    />
  );
  const SelectY = (
    <Select
      value={yType}
      onChange={setYType as any}
      data={options}
      label="Data for Y"
      description="Select the data that will be used for the Y axis."
      searchable={false}
    />
  );
  const SelectColor = (
    <Select
      value={colorType}
      label="Data for Color"
      data={options}
      onChange={setColorType as any}
      description="Select the data that will be used as the color for the scatter plot."
      searchable={false}
    />
  );

  const xConfig = xType
    ? TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[xType]
    : undefined;
  const yConfig = yType
    ? TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[yType]
    : undefined;
  const colorConfig = colorType
    ? TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY[colorType]
    : undefined;

  const trials = React.useMemo(() => {
    const accessorX = xConfig?.accessor;
    const accessorY = yConfig?.accessor;
    if (!accessorX || !accessorY) {
      return data.trials;
    }
    const trials = data.trials
      .filter((trial) => {
        return accessorX(trial) != null && accessorY(trial) != null;
      })
      .sort((a, b) => accessorX(a)! - accessorX(b)!);
    return trials;
  }, [data.trials, xConfig?.accessor, yConfig?.accessor]);

  return {
    options,
    trials,
    xConfig,
    yConfig,
    colorConfig,
    SelectX,
    SelectY,
    SelectColor,
    xType,
    yType,
    colorType,
  };
}
