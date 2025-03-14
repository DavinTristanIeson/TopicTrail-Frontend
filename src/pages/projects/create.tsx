import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigCreateForm from '@/modules/config/create';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateProjectPage() {
  return (
    <AppLayout Header={<AppHeader title="Create New Project" />}>
      <ProjectConfigCreateForm />
    </AppLayout>
  );
}
