import AppProjectLayout from '@/modules/project/layout';
import TableDashboard from '@/modules/table/dashboard';
import TableQueryComponent from '@/modules/table/table';
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
        <TableDashboard />
      </div>
    </AppProjectLayout>
  );
}
