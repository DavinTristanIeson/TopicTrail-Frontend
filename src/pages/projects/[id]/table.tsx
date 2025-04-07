import TableQueryComponent from '@/modules/table';
import { Tabs } from '@mantine/core';
import React from 'react';
import dynamic from 'next/dynamic';
import { GridSkeleton } from '@/components/visual/loading';
import { Shapes, Table } from '@phosphor-icons/react';
import { DashboardControls } from '@/modules/visualization/dashboard/controls';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';

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

const TablePage: NextPageWithLayout = function TablePage() {
  const [tab, setTab] = React.useState<string | null>(TablePageTab.Table);
  return (
    <>
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
        <>
          {tab === TablePageTab.Table ? (
            <TableQueryComponent />
          ) : tab === TablePageTab.Dashboard ? (
            <>
              <DashboardControls />
              <GridstackDashboard />
            </>
          ) : null}
        </>
      </div>
    </>
  );
};

TablePage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default TablePage;
