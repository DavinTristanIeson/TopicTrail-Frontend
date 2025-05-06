import NavigationRoutes from '@/common/constants/routes';
import { Alert, Anchor, Text } from '@mantine/core';
import { QuestionMark, Warning, XCircle } from '@phosphor-icons/react';
import React from 'react';
import { ProjectPageLinks } from '@/components/utility/links';
import { filterProjectColumnsByType, SchemaColumnModel } from '@/api/project';
import { ProjectContext } from '@/modules/project/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  AllTopicModelingResultContext,
  useTopicModelingResultOfColumn,
} from './context';
import Link from 'next/link';
import { useTopicAppState } from '../app-state';

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

interface TopicModelingRequirementSafeguardProps {
  canSelectColumn?: boolean;
  children?: React.ReactNode;
}

export function TopicModelingRequirementSafeguard(
  props: TopicModelingRequirementSafeguardProps,
) {
  const { canSelectColumn, children } = props;
  const project = React.useContext(ProjectContext);
  const column = useTopicAppState((store) => store.column);
  const topicModelingResult = useTopicModelingResultOfColumn(column?.name);

  const returnLink = (
    <Anchor
      inherit
      component={Link}
      href={{
        pathname: NavigationRoutes.ProjectTopics,
        query: {
          id: project.id,
        },
      }}
    >
      go back
    </Anchor>
  );

  if (!column) {
    const message =
      'It seems that you haven&apos;t chosen a column to be operated on.';
    if (canSelectColumn) {
      return (
        <Alert title="Missing column?" color="red" icon={<QuestionMark />}>
          {message} Please choose a column first
        </Alert>
      );
    } else {
      return (
        <Alert title="Missing column?" color="red" icon={<QuestionMark />}>
          It seems that you haven&apos;t chosen a column to be operated on.
          Perhaps you should {returnLink} and choose a column?
        </Alert>
      );
    }
  }

  if (!topicModelingResult?.result) {
    return (
      <Alert title="No Topic Modeling Result" color="red" icon={<XCircle />}>
        The topic modeling algorithm has not been executed on this column. You
        should run the topic modeling algorithm first to automatically discover
        some topics in your dataset. Please {returnLink} and run the topic
        modeling algorithm on this column.
      </Alert>
    );
  }

  return children;
}
