import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';
import {
  BaseVisualizationConfig,
  BaseVisualizationDataProviderHook,
} from '../types';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries } from './utils';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { getTopicLabel } from '@/api/topic';
import { TableSortModel } from '@/api/table';

export interface TableValuesDataProvider {
  sort: TableSortModel | null;
}

export const useTableValuesDataProvider: BaseVisualizationDataProviderHook<
  (string | number)[],
  BaseVisualizationConfig
> = function (config) {
  const project = React.useContext(ProjectContext);
  const topicModelingResult = useTopicModelingResultOfColumn(
    config.column.source_name ?? '',
  );

  const queries = useQueries({
    queries: config.groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/unique', {
        body: {
          column: config.column.name,
          filter: group.filter,
        },
        params: {
          path: {
            project_id: project.id,
          },
        },
      }),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups: config.groups,
    extract: (data) => {
      const topicLabelMap = new Map(
        topicModelingResult?.result?.topics.map((topic) => [
          topic.id,
          getTopicLabel(topic),
        ]) ?? [],
      );
      if (config.column.type === SchemaColumnTypeEnum.Topic) {
        return data.data.values.map((value) => {
          return (
            topicLabelMap.get(value as number) ??
            getTopicLabel({ id: value as number })
          );
        });
      } else {
        return data.data.values as (string | number)[];
      }
    },
  });
};
