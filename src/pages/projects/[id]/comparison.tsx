import { NamedTableFilterModel } from '@/api/table';
import { NamedFiltersContext } from '@/modules/comparison/context';
import NamedFiltersManager from '@/modules/comparison/filter';
import AppProjectLayout from '@/modules/project/layout';
import { ProjectAllTopicsProvider } from '@/modules/topics/components/context';
import DashboardManager from '@/modules/visualization/dashboard';
import { Divider, Title } from '@mantine/core';
import React from 'react';

function ComparisonPageStateManager() {
  const [filters, setFilters] = React.useState<NamedTableFilterModel[]>([]);
  return (
    <NamedFiltersContext.Provider value={{ filters, setFilters }}>
      <Title order={2} className="pb-3">
        Manage Groups
      </Title>
      <div className="border border-solid border-gray-200 rounded-xl p-3">
        <NamedFiltersManager />
      </div>
      <Divider className="my-5" />
      <DashboardManager />
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
