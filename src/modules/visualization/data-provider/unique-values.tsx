import { client } from '@/common/api/client';
import { BaseVisualizationDataProviderHook } from '../types/base';
import { useQueries } from '@tanstack/react-query';
import { useAdaptDataProviderQueries, usePrepareDataProvider } from './utils';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { getTopicLabel } from '@/api/topic';
import { TableSortModel } from '@/api/table';

export interface TableValuesDataProvider {
  sort: TableSortModel | null;
}

export const useTableValuesDataProvider: BaseVisualizationDataProviderHook<
  (string | number)[],
  object
> = function (item) {
  const { groups, column, params } = usePrepareDataProvider(item);
  const topicModelingResult = useTopicModelingResultOfColumn(
    column?.source_name ?? '',
  );

  const queries = useQueries({
    queries: groups.map((group) =>
      client.queryOptions('post', '/table/{project_id}/column/unique', {
        body: {
          column: item.column,
          filter: group.filter,
        },
        params,
      }),
    ),
  });

  return useAdaptDataProviderQueries({
    queries,
    groups,
    extract: (data) => {
      const topicLabelMap = new Map(
        topicModelingResult?.result?.topics.map((topic) => [
          topic.id,
          getTopicLabel(topic),
        ]) ?? [],
      );
      if (column.type === SchemaColumnTypeEnum.Topic) {
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
