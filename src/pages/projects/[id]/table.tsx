import DashboardManager from '@/modules/visualization/dashboard';
import AppProjectLayout from '@/modules/project/layout';
import TableQueryComponent from '@/modules/table';
import { Divider } from '@mantine/core';
import React from 'react';
import { ProjectAllTopicsProvider } from '@/modules/topics/components/context';

export default function TablePage() {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <div className="min-h-96">
          <TableQueryComponent />
        </div>
        <Divider className="my-5" />
        <DashboardManager />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
