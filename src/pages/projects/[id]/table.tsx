import AppProjectLayout from '@/modules/project/layout';
import TableQueryComponent from '@/modules/table';
import { Divider } from '@mantine/core';
import React from 'react';
import { ProjectAllTopicsProvider } from '@/modules/topics/components/context';
import dynamic from 'next/dynamic';
import { GridSkeleton } from '@/components/visual/loading';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

export default function TablePage() {
  return (
    <AppProjectLayout>
      <ProjectAllTopicsProvider>
        <div className="min-h-96">
          <TableQueryComponent />
        </div>
        <Divider className="my-5" />
        <GridstackDashboard />
      </ProjectAllTopicsProvider>
    </AppProjectLayout>
  );
}
