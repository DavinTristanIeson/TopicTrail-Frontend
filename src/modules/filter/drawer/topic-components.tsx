import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import NavigationRoutes from '@/common/constants/routes';
import { ProjectPageLinks } from '@/components/utility/links';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import {
  TopicMultiSelectField,
  TopicMultiSelectFieldProps,
  TopicSelectField,
  TopicSelectFieldProps,
} from '@/modules/topics/components/select-topic-input';
import { Alert } from '@mantine/core';
import React from 'react';

function useProvideTopicSelectInputData(column: SchemaColumnModel | undefined) {
  let sourceName = '';
  if (column && column.type === SchemaColumnTypeEnum.Topic) {
    sourceName = column.source_name!;
  }
  const topicModelingResult = useTopicModelingResultOfColumn(sourceName);
  if (sourceName) {
    return topicModelingResult?.result?.topics ?? [];
  } else {
    return null;
  }
}

function NoTopicAlert() {
  return (
    <Alert color="red" title="There are no topics!">
      It seems that the topic modeling procedure has not been executed on this
      column. You should go to the{' '}
      <ProjectPageLinks route={NavigationRoutes.ProjectTopics}>
        Topics Page
      </ProjectPageLinks>{' '}
      and execute the topic modeling procedure. There is also the possibility
      that the topic modeling procedure failed to find any meaningful topics
      according to your topic modeling configuration.
    </Alert>
  );
}

type TopicFilterSelectFieldProps = Omit<TopicSelectFieldProps, 'data'> & {
  column: SchemaColumnModel;
};
export function TopicFilterSelectField(props: TopicFilterSelectFieldProps) {
  const topics = useProvideTopicSelectInputData(props.column);
  if (!topics) {
    return <NoTopicAlert />;
  }
  return <TopicSelectField data={topics} {...props} />;
}

type TopicFilterMultiSelectFieldProps = Omit<
  TopicMultiSelectFieldProps,
  'data'
> & {
  column: SchemaColumnModel;
};

export function TopicFilterMultiSelectField(
  props: TopicFilterMultiSelectFieldProps,
) {
  const topics = useProvideTopicSelectInputData(props.column);
  if (!topics) {
    return <NoTopicAlert />;
  }
  return <TopicMultiSelectField data={topics} {...props} />;
}
