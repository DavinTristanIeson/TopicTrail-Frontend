import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import TopicEvaluationControls from '@/modules/topic-evaluation/controls';
import TopicEvaluationResultComponent from '@/modules/topic-evaluation/result';
import { MinimalTopicRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Stack } from '@mantine/core';
import React from 'react';

const TopicEvaluationPage: NextPageWithLayout = function () {
  return (
    <MinimalTopicRequirementSafeguard>
      <Stack>
        <TopicEvaluationControls />
        <TopicEvaluationResultComponent />
      </Stack>
    </MinimalTopicRequirementSafeguard>
  );
};

TopicEvaluationPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TopicEvaluationPage;
