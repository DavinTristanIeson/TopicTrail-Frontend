import NavigationRoutes from '@/common/constants/routes';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import RefineTopicsForm from '@/modules/refine-topics/form';
import {
  ProjectAllTopicsProvider,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { Alert, Anchor, Divider, List, Text } from '@mantine/core';
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
        some topics in your dataset.
      </Alert>
    );
  }

  return (
    <>
      <Alert title="What is this used for?" color="blue">
        <Text>
          The topic modeling algorithm may have managed to discover some topics
          automatically for you. However, some of the topic assignments may be
          incorrect; for example:
        </Text>
        <List withPadding listStyleType="disc">
          <List.Item>
            A document may be wrongly assigned to the wrong topic, so the topic
            assignment needs to be fixed.
          </List.Item>
          <List.Item>
            Two or more topics discuss about the same concept/theme so they need
            to be merged into one large topic. This usually occurs if you have a
            low maximum topic size.
          </List.Item>
          <List.Item>
            A single topic encompasses too many concepts at once, so it needs to
            be split into multiple smaller topics.
          </List.Item>
        </List>

        <Divider className="my-5" />

        <Text>
          In order to remedy the issues above, you can use this page to:
        </Text>
        <List withPadding listStyleType="disc">
          <List.Item>Change the topic of a single document.</List.Item>
          <List.Item>
            Change the topics of multiple documents at once.
          </List.Item>
          <List.Item>
            Change the label, description, and tags of a topic to help you
            understand it easily outside of the Topics page.
          </List.Item>
          <List.Item>
            Reorder the topics so that relevant topics show up earlier in any
            select inputs.
          </List.Item>
        </List>

        <Divider className="my-5" />
        <Text fw={500} c="red">
          Please note that topics that are not assigned to at least one document
          will be automatically removed.
        </Text>
      </Alert>
      <RefineTopicsForm topicModelingResult={topicModelingResult} />
    </>
  );
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
