import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import {
  AllTopicModelingResultContext,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { Alert, Group, Paper, Text } from '@mantine/core';
import React from 'react';
import ProjectTopicsEmptyPage from '@/modules/topics/empty';
import ProjectTopicResultsPage from '@/modules/topics/results';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';
import { SchemaColumnContext } from '@/modules/project/context';
import { useRouter } from 'next/router';
import TopicResultsPageControls from '@/modules/topics/results/controls';
import { Warning } from '@phosphor-icons/react';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { NextPageWithLayout } from '@/common/utils/types';

interface ProjectTopicSwitcherProps {
  column: string;
}

function ProjectTopicPageSwitcher(props: ProjectTopicSwitcherProps) {
  const { column } = props;
  const topicModelingResult = useTopicModelingResultOfColumn(column);
  if (!topicModelingResult) {
    return null;
  }
  return (
    <SchemaColumnContext.Provider value={topicModelingResult.column}>
      {topicModelingResult.result ? (
        topicModelingResult.result.topics.length === 0 ? (
          <Alert color="red" icon={<Warning />}>
            Oops, even though the topic modeling algorithm has been run on this
            dataset. It seems like that it did not manage to find any topics.
            This may be because there are no apparent themes in the dataset, or
            because your preprocessing or topic modeling configuration is too
            strict.
          </Alert>
        ) : (
          <ProjectTopicResultsPage />
        )
      ) : (
        <ProjectTopicsEmptyPage />
      )}
    </SchemaColumnContext.Provider>
  );
}

const ProjectTopicsPage: NextPageWithLayout = function () {
  const topicModelingResults = React.useContext(AllTopicModelingResultContext);

  const queryColumn = useRouter().query.column as string;
  const [columnName, setColumn] = React.useState<string | null>(
    queryColumn ?? null,
  );

  const columns = topicModelingResults.map((result) => result.column);
  const firstColumn = columns[0];
  // Focus on the first column
  const hasInitializedColumn = React.useRef(!!queryColumn);
  React.useEffect(() => {
    if (hasInitializedColumn.current) return;
    if (!firstColumn) return;
    setColumn(firstColumn.name);
    hasInitializedColumn.current = true;
  }, [firstColumn]);

  const focusedTopicModelingResult = topicModelingResults
    ? topicModelingResults.find((result) => result.column.name === columnName)
    : undefined;

  return (
    <div className="relative">
      <Paper className="p-3 sticky top-0" radius={0}>
        <Group justify="space-between">
          <ProjectColumnSelectInput
            data={columns}
            value={columnName}
            onChange={(col) => setColumn(col?.name ?? null)}
            allowDeselect={false}
            styles={{
              input: {
                width: 384,
              },
            }}
            disabled={columns.length === 0}
            inputContainer={(children) => (
              <Group>
                <Text c="gray" size="sm">
                  Column
                </Text>
                {children}
              </Group>
            )}
          />
          {focusedTopicModelingResult && focusedTopicModelingResult.result && (
            <Group>
              <TopicResultsPageControls
                column={focusedTopicModelingResult.column}
              />
            </Group>
          )}
        </Group>
      </Paper>
      <div className="pt-4 px-3">
        {columns.length === 0 && <NoTextualColumnWarning />}
        {columnName && <ProjectTopicPageSwitcher column={columnName} />}
      </div>
    </div>
  );
};

ProjectTopicsPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default ProjectTopicsPage;
