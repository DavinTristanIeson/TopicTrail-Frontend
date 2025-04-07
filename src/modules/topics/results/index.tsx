import { Stack, Tabs } from '@mantine/core';
import DocumentsPerTopicTable from './document-table';
import React from 'react';
import { Cards, Files } from '@phosphor-icons/react';
import TopicVisualizationRenderer from './topics';
import { useTopicAppState } from '../app-state';

export enum TopicsPageTab {
  Topics = 'topics',
  Documents = 'documents',
}

export default function ProjectTopicResultsPage() {
  const { state: tab, setState: setTab } = useTopicAppState(
    (store) => store.tab,
  );
  return (
    <Stack className="w-full pt-3">
      <Tabs value={tab} onChange={setTab as any} allowTabDeactivation={false}>
        <Tabs.List>
          <Tabs.Tab value={TopicsPageTab.Topics} leftSection={<Cards />}>
            Topics
          </Tabs.Tab>
          <Tabs.Tab value={TopicsPageTab.Documents} leftSection={<Files />}>
            Documents
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {tab === TopicsPageTab.Topics ? (
        <TopicVisualizationRenderer />
      ) : (
        <DocumentsPerTopicTable />
      )}
    </Stack>
  );
}
