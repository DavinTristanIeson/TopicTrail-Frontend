import {
  AllTopicModelingResultContext,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { Alert, Group } from '@mantine/core';
import React from 'react';
import ProjectTopicsEmptyPage from '@/modules/topics/empty';
import ProjectTopicResultsPage from '@/modules/topics/results';
import { NoTextualColumnWarning } from '@/modules/topics/components/warnings';
import TopicResultsPageControls from '@/modules/topics/results/controls';
import { Warning } from '@phosphor-icons/react';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { NextPageWithLayout } from '@/common/utils/types';
import { useTopicAppState } from '@/modules/topics/app-state';
import { ProjectFocusedTextualColumnControls } from '@/modules/topics/components/controls';

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
    <>
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
    </>
  );
}

const ProjectTopicsPage: NextPageWithLayout = function () {
  const topicModelingResults = React.useContext(AllTopicModelingResultContext);
  const columns = topicModelingResults.map((result) => result.column);
  const column = useTopicAppState((store) => store.column);
  const focusedTopicModelingResult =
    topicModelingResults && column
      ? topicModelingResults.find(
          (result) => result.column.name === column.name,
        )
      : undefined;

  return (
    <>
      <ProjectFocusedTextualColumnControls
        Right={
          focusedTopicModelingResult &&
          focusedTopicModelingResult.result && (
            <Group>
              <TopicResultsPageControls
                column={focusedTopicModelingResult.column}
              />
            </Group>
          )
        }
      />
      <div>
        {columns.length === 0 && <NoTextualColumnWarning />}
        {column && <ProjectTopicPageSwitcher column={column.name} />}
      </div>
    </>
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
