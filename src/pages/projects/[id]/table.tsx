import AppProjectLayout from '@/modules/project/layout';
import TableQueryComponent from '@/modules/table';
import { Tabs } from '@mantine/core';
import React from 'react';
import { ProjectAllTopicsProvider } from '@/modules/topics/components/context';
import dynamic from 'next/dynamic';
import { GridSkeleton } from '@/components/visual/loading';
import { Shapes, Table } from '@phosphor-icons/react';
import { FilterStateProvider } from '@/modules/table/context';
import { DashboardControls } from '@/modules/visualization/dashboard/controls';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

enum TablePageTab {
  Table = 'table',
  Dashboard = 'dashboard',
}

export default function TablePage() {
  const [tab, setTab] = React.useState<string | null>(TablePageTab.Table);
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <Tabs value={tab} onChange={setTab} allowTabDeactivation={false}>
          <Tabs.List>
            <Tabs.Tab value={TablePageTab.Table} leftSection={<Table />}>
              Table
            </Tabs.Tab>
            <Tabs.Tab value={TablePageTab.Dashboard} leftSection={<Shapes />}>
              Dashboard
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        <div className="pt-5">
          <FilterStateProvider>
            {tab === TablePageTab.Table ? (
              <TableQueryComponent />
            ) : tab === TablePageTab.Dashboard ? (
              <>
                <DashboardControls />
                <GridstackDashboard />
              </>
            ) : null}
          </FilterStateProvider>
        </div>
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
