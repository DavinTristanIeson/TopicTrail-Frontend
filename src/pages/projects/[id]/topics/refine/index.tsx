import NavigationRoutes from '@/common/constants/routes';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import RefineTopicsForm from '@/modules/refine-topics.tsx/form';
import {
  ProjectAllTopicsProvider,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { Alert, Anchor } from '@mantine/core';
import { QuestionMark, XCircle } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

function TopicsAvailabilitySafeguard() {
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  const column = decodeURIComponent(router.query.column as string);
  const topicModelingResult = useTopicModelingResultOfColumn(column);

  const returnLink = (
    <Anchor
      inherit
      component={Link}
      href={{
        pathname: NavigationRoutes.ProjectTopics,
        query: column
          ? {
              id: project.id,
              column: column,
            }
          : {
              id: project.id,
            },
      }}
    >
      go back
    </Anchor>
  );

  if (!router.query.column) {
    return (
      <Alert title="Missing column?" color="red" icon={<QuestionMark />}>
        It seems that you haven&apos;t chosen a column to be refined. Perhaps
        you should {returnLink} and choose a column?
      </Alert>
    );
  }

  if (!topicModelingResult) {
    return (
      <Alert title="Missing column?" color="red" icon={<QuestionMark />}>
        We were not able to find any columns named &quot;{column}&quot; in your
        dataset. Perhaps you should {returnLink} and choose another column?
      </Alert>
    );
  }

  if (!topicModelingResult.result) {
    return (
      <Alert title="No Topic Modeling Result" color="red" icon={<XCircle />}>
        The topic modeling algorithm has not been executed on this column. You
        should run the topic modeling algorithm first to automatically discover
        some topics in your dataset. Afterwards, you can use your own knowledge
        on the subject matter to label and refine the topics to facilitate your
        analysis. Why don&apos;t you {returnLink} and start the topic modeling
        procedure to get started?
      </Alert>
    );
  }

  return <RefineTopicsForm topicModelingResult={topicModelingResult} />;
}

export default function RefineTopicsPage() {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <TopicsAvailabilitySafeguard />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
