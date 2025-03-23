import { type NamedTableFilterModel } from '@/api/comparison';
import { LocalStorageKeys } from '@/common/constants/browser-storage-keys';
import { GridSkeleton } from '@/components/visual/loading';
import { NamedFiltersContext } from '@/modules/comparison/context';
import NamedFiltersManager from '@/modules/comparison/filter';
import { OpenStatisticTestModalButton } from '@/modules/comparison/statistic-test';
import AppProjectLayout from '@/modules/project/layout';
import { ProjectAllTopicsProvider } from '@/modules/topics/components/context';
import { AddTableVisualizationButton } from '@/modules/visualization/dashboard/add-visualization-dialog';
import { Divider, Group, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import React from 'react';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

function ComparisonPageStateManager() {
  const [filters, setFilters] = useLocalStorage<NamedTableFilterModel[]>({
    key: LocalStorageKeys.ComparisonParams,
    defaultValue: [],
  });
  return (
    <NamedFiltersContext.Provider value={{ filters, setFilters }}>
      <Title order={2} className="pb-3">
        Groups
      </Title>
      <div className="border border-solid border-gray-200 rounded-xl p-3">
        <NamedFiltersManager />
      </div>
      <Divider className="my-5" />
      <Group justify="end">
        <OpenStatisticTestModalButton />
        <AddTableVisualizationButton />
      </Group>
      <GridstackDashboard />
    </NamedFiltersContext.Provider>
  );
}

export default function ComparisonPage() {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <ComparisonPageStateManager />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
