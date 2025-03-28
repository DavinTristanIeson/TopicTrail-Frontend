import NavigationRoutes from '@/common/constants/routes';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import {
  ProjectAllTopicsProvider,
  useTopicModelingResultOfColumn,
} from '@/modules/topics/components/context';
import { Alert, Text, Button } from '@mantine/core';
import { QuestionMark, XCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

function TopicsAvailabilitySafeguard() {
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  const column = decodeURIComponent(router.query.column as string);
  const topicModelingResult = useTopicModelingResultOfColumn(column);

  if (!topicModelingResult) {
    return (
      <Alert title="Missing column?" color="red" icon={<QuestionMark />}>
        <Text inherit>
          We were not able to find any columns named &quot;{column}&quot; in
          your dataset. Perhaps you should go back and choose another column?
        </Text>
        <Button
          variant="outline"
          onClick={() => {
            router.replace(NavigationRoutes.ProjectTopics, {
              query: {
                id: project.id,
              },
            });
          }}
        >
          Return to Topics Page
        </Button>
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
        analysis.
        <Button
          variant="outline"
          onClick={() => {
            router.replace(NavigationRoutes.ProjectTopics, {
              query: {
                id: project.id,
              },
            });
          }}
        >
          Return to Topics Page
        </Button>
      </Alert>
    );
  }
}

export default function RefineTopicsPage() {
  return (
    <AppProjectLayout withPadding={false}>
      <ProjectAllTopicsProvider>
        <TopicsAvailabilitySafeguard />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
