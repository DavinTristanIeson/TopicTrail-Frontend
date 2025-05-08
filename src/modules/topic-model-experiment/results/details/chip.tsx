import React from 'react';
import { TopicModelExperimentValueSort } from '../../app-state';
import {
  TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY,
  TopicModelExperimentValueType,
  useTopicModelExperimentValueOptions,
} from '../component/select';
import { Chip, Group, Input } from '@mantine/core';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { BERTopicExperimentResultModel } from '@/api/topic';

interface TopicModelExperimentResultSortChipProps {
  value: TopicModelExperimentValueType;
  label: string;
  sortBy: TopicModelExperimentValueSort | null;
  setSortBy: React.Dispatch<
    React.SetStateAction<TopicModelExperimentValueSort | null>
  >;
}

function TopicModelExperimentResultSortChip(
  props: TopicModelExperimentResultSortChipProps,
) {
  const { value, label, sortBy, setSortBy } = props;
  const sort = sortBy?.type === value ? sortBy : undefined;
  return (
    <Chip
      key={value}
      checked={!!sort}
      icon={sort?.asc ? <CaretUp /> : <CaretDown />}
      onChange={() => {
        if (sort == null) {
          setSortBy({
            type: value,
            asc: true,
          });
        } else {
          setSortBy((sortBy) => {
            if (!sortBy) {
              return {
                type: value,
                asc: true,
              };
            }
            return {
              ...sortBy,
              asc: !sortBy.asc,
            };
          });
        }
      }}
    >
      {label}
    </Chip>
  );
}

interface TopicModelExperimentResultSortByChoiceChipsProps {
  sortBy: TopicModelExperimentValueSort | null;
  setSortBy: React.Dispatch<
    React.SetStateAction<TopicModelExperimentValueSort | null>
  >;
  data: BERTopicExperimentResultModel;
}

export default function TopicModelExperimentResultSortByChoiceChips(
  props: TopicModelExperimentResultSortByChoiceChipsProps,
) {
  const { data, sortBy, setSortBy } = props;
  const options = useTopicModelExperimentValueOptions({
    constraint: data.constraint,
  });
  return (
    <>
      {options.map((group) => (
        <Input.Wrapper key={group.group} label={group.group}>
          <Group wrap="wrap">
            {Object.values(TOPIC_MODEL_EXPERIMENT_VALUE_TYPE_DICTIONARY).map(
              (entry) => {
                return (
                  <TopicModelExperimentResultSortChip
                    key={entry.value}
                    value={entry.value}
                    label={entry.label}
                    setSortBy={setSortBy}
                    sortBy={sortBy}
                  />
                );
              },
            )}
          </Group>
        </Input.Wrapper>
      ))}
    </>
  );
}
