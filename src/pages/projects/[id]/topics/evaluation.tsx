import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import TopicEvaluationControls from '@/modules/topic-evaluation/controls';
import TopicEvaluationResultComponent from '@/modules/topic-evaluation/result';
import {
  ProjectFocusedTextualColumnControls,
  ReturnToTopicsPageButton,
} from '@/modules/topics/components/controls';
import { TopicModelingRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Stack } from '@mantine/core';
import React from 'react';

const TopicEvaluationPage: NextPageWithLayout = function () {
  return (
    <Stack>
      <ProjectFocusedTextualColumnControls
        onlyColumnsWithTopics
        Right={<ReturnToTopicsPageButton />}
      />
      <TopicModelingRequirementSafeguard canSelectColumn>
        <TopicEvaluationControls />
        <TopicEvaluationResultComponent />
      </TopicModelingRequirementSafeguard>
    </Stack>
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
