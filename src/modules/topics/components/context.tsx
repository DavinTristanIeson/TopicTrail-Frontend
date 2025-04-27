import { ColumnTopicModelingResultModel } from '@/api/topic';
import { client } from '@/common/api/client';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';

export const AllTopicModelingResultContext = React.createContext<
  ColumnTopicModelingResultModel[]
>(undefined as any);

export function useTopicModelingResultOfColumn(
  column: string,
): ColumnTopicModelingResultModel | undefined {
  const allTopics = React.useContext(AllTopicModelingResultContext);
  return allTopics.find(
    (textualColumn) => textualColumn.column.name === column,
  );
}

export function ProjectAllTopicsProvider(props: React.PropsWithChildren) {
  const { children } = props;
  const project = React.useContext(ProjectContext);
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/',
    {
      params: {
        path: {
          project_id: project.id,
        },
      },
    },
    {
      // We'll assume that only one person is using this at a time.
      staleTime: Infinity,
    },
  );
  const allTopicModelingResults = query.data?.data;

  const projectWithoutInvalidColumns = React.useMemo(() => {
    if (!allTopicModelingResults) return project;
    return {
      ...project,
      config: {
        ...project.config,
        data_schema: {
          ...project.config.data_schema,
          columns: project.config.data_schema.columns.filter((column) => {
            // Not internal column. Don't have to care.
            if (!column.source_name) {
              return true;
            }
            const columnTopicModelResult = allTopicModelingResults.find(
              (topicModelingResult) =>
                topicModelingResult.column.name === column.name,
            );
            // Not textual column. Don't have to care.
            if (!columnTopicModelResult) {
              return true;
            }
            // Only allow this if it has topic modeling result.
            return !!columnTopicModelResult.result;
          }),
        },
      },
    };
  }, [allTopicModelingResults, project]);
  return (
    <UseQueryWrapperComponent query={query}>
      {allTopicModelingResults && (
        <ProjectContext.Provider value={projectWithoutInvalidColumns}>
          <AllTopicModelingResultContext.Provider
            value={allTopicModelingResults}
          >
            {children}
          </AllTopicModelingResultContext.Provider>
        </ProjectContext.Provider>
      )}
    </UseQueryWrapperComponent>
  );
}
