import DashboardManager from '@/modules/visualization/dashboard';
import AppProjectLayout from '@/modules/project/layout';
import TableQueryComponent from '@/modules/table';
import { Divider } from '@mantine/core';
import React from 'react';

export default function TablePage() {
  return (
    <AppProjectLayout>
      <div className="px-3 pt-3">
        <div className="min-h-96">
          <TableQueryComponent />
        </div>
        <Divider className="my-5" />
        <DashboardManager />
      </div>
    </AppProjectLayout>
  );
}
