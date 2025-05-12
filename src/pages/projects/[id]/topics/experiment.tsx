import { NextPageWithLayout } from '@/common/utils/types';
import { DefaultErrorViewBoundary } from '@/components/visual/error';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import {
  TopicModelExperimentTab,
  useTopicModelExperimentAppState,
} from '@/modules/topic-model-experiment/app-state';
import TopicModelExperimentConstraintTab from '@/modules/topic-model-experiment/constraint';
import TopicModelExperimentDetailsTab from '@/modules/topic-model-experiment/results/details';
import TopicModelExperimentResultSummaryTab from '@/modules/topic-model-experiment/results/summary';
import { useTopicAppState } from '@/modules/topics/app-state';
import {
  ProjectFocusedTextualColumnControls,
  ReturnToTopicsPageButton,
} from '@/modules/topics/components/controls';
import { TopicModelingRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Stack, Tabs } from '@mantine/core';
import { Faders, List, Shapes } from '@phosphor-icons/react';
import React from 'react';

const TopicModelExperimentPage: NextPageWithLayout = function () {
  const column = useTopicAppState((store) => store.column);
  const tab = useTopicModelExperimentAppState((store) => store.tab);
  const setTab = useTopicModelExperimentAppState((store) => store.setTab);

  return (
    <Stack>
      <ProjectFocusedTextualColumnControls
        onlyColumnsWithTopics
        Right={<ReturnToTopicsPageButton />}
      />

      <TopicModelingRequirementSafeguard canSelectColumn>
        {column && (
          <>
            <Tabs
              value={tab}
              onChange={setTab as any}
              allowTabDeactivation={false}
            >
              <Tabs.List>
                <Tabs.Tab
                  value={TopicModelExperimentTab.Constraint}
                  leftSection={<Faders />}
                >
                  Constraint
                </Tabs.Tab>
                <Tabs.Tab
                  value={TopicModelExperimentTab.Summary}
                  leftSection={<Shapes />}
                >
                  Summary
                </Tabs.Tab>
                <Tabs.Tab
                  value={TopicModelExperimentTab.Details}
                  leftSection={<List />}
                >
                  Details
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
            <DefaultErrorViewBoundary>
              {tab === TopicModelExperimentTab.Constraint ? (
                <TopicModelExperimentConstraintTab />
              ) : tab === TopicModelExperimentTab.Summary ? (
                <TopicModelExperimentResultSummaryTab />
              ) : tab === TopicModelExperimentTab.Details ? (
                <TopicModelExperimentDetailsTab />
              ) : null}
            </DefaultErrorViewBoundary>
          </>
        )}
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
