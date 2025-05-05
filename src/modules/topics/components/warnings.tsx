import NavigationRoutes from '@/common/constants/routes';
import { Alert, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import { ProjectPageLinks } from '@/components/utility/links';
import { filterProjectColumnsByType, SchemaColumnModel } from '@/api/project';
import { ProjectContext } from '@/modules/project/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { AllTopicModelingResultContext } from './context';

export function NoTextualColumnWarning() {
  return (
    <Alert icon={<Warning />} color="yellow" title="There are no columns!">
      There are no textual columns in your dataset, which means that the{' '}
      <Text className="font-semibold" span inherit>
        Topics
      </Text>{' '}
      and{' '}
      <Text className="font-semibold" span inherit>
        Topic Correlation
      </Text>{' '}
      page will not be useful to you. Consider using the{' '}
      <ProjectPageLinks route={NavigationRoutes.ProjectComparison}>
        Table Page
      </ProjectPageLinks>{' '}
      or{' '}
      <ProjectPageLinks route={NavigationRoutes.ProjectComparison}>
        Comparison Page
      </ProjectPageLinks>{' '}
      instead.
    </Alert>
  );
}

interface RunTopicModelingOnAnyColumnsWarningProps {
  columns: SchemaColumnModel[];
}

export function RunTopicModelingOnAnyColumnsWarning(
  props: RunTopicModelingOnAnyColumnsWarningProps,
) {
  const { columns } = props;
  return (
    <Alert icon={<Warning />} color="red" title="There are no topics!">
      {`Please run the topic modeling algorithm on at least one of the following columns: ${columns.map((column) => column.name).join(', ')} in order to use the analysis methods in this page. You can find the topics from the `}
      <ProjectPageLinks route={NavigationRoutes.ProjectTopics}>
        Topics Page
      </ProjectPageLinks>
      .
    </Alert>
  );
}

export function MinimalTopicRequirementSafeguard(
  props: React.PropsWithChildren,
) {
  const project = React.useContext(ProjectContext);
  const textualColumns = filterProjectColumnsByType(project, [
    SchemaColumnTypeEnum.Textual,
  ]);
  const allTopicModelingResults = React.useContext(
    AllTopicModelingResultContext,
  );
  if (textualColumns.length === 0) {
    return <NoTextualColumnWarning />;
  }
  const topicModelingResults = allTopicModelingResults.filter(
    (topic) => !!topic.result,
  );
  const topicModelingColumns = topicModelingResults.map(
    (result) => result.column,
  );
  if (topicModelingResults.length === 0) {
    return (
      <RunTopicModelingOnAnyColumnsWarning columns={topicModelingColumns} />
    );
  }
  return props.children;
}
