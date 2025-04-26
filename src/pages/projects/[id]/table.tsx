import TableQueryComponent from '@/modules/table';
import { Tabs } from '@mantine/core';
import React from 'react';
import { Shapes, Table } from '@phosphor-icons/react';
import { NextPageWithLayout } from '@/common/utils/types';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { TablePageTab, useTableAppState } from '@/modules/table/app-state';
import { TableDashboard } from '@/modules/table/dashboard';

const TablePage: NextPageWithLayout = function TablePage() {
  const tab = useTableAppState((store) => store.tab);
  const setTab = useTableAppState((store) => store.setTab);
  return (
    <>
      <Tabs value={tab} onChange={setTab as any} allowTabDeactivation={false}>
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
            <TableDashboard />
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
