import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import {
  TopicModelExperimentTab,
  useTopicModelExperimentAppState,
} from '@/modules/topic-model-experiment/app-state';
import TopicModelExperimentConstraintTab from '@/modules/topic-model-experiment/constraint';
import {
  ProjectFocusedTextualColumnControls,
  ReturnToTopicsPageButton,
} from '@/modules/topics/components/controls';
import { TopicModelingRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Stack, Tabs } from '@mantine/core';
import { Checks, Faders } from '@phosphor-icons/react';
import React from 'react';

const TopicModelExperimentPage: NextPageWithLayout = function () {
  const tab = useTopicModelExperimentAppState((store) => store.tab);
  const setTab = useTopicModelExperimentAppState((store) => store.setTab);

  return (
    <Stack>
      <ProjectFocusedTextualColumnControls
        Right={<ReturnToTopicsPageButton />}
      />

      <TopicModelingRequirementSafeguard canSelectColumn>
        <Tabs value={tab} onChange={setTab as any} allowTabDeactivation={false}>
          <Tabs.List>
            <Tabs.Tab
              value={TopicModelExperimentTab.Constraint}
              leftSection={<Faders />}
            >
              Constraint
            </Tabs.Tab>
            <Tabs.Tab
              value={TopicModelExperimentTab.Results}
              leftSection={<Checks />}
            >
              Results
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {tab === TopicModelExperimentTab.Constraint ? (
          <TopicModelExperimentConstraintTab />
        ) : tab === TopicModelExperimentTab.Results ? (
          <></>
        ) : null}
      </TopicModelingRequirementSafeguard>
    </Stack>
  );
};

TopicModelExperimentPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TopicModelExperimentPage;
