import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigCreateForm from '@/modules/config/create';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateProjectPage() {
  const router = useRouter();
  return (
    <AppLayout Header={<AppHeader title="Create New Project" />}>
      <ProjectConfigCreateForm
        onSubmit={(data) => {
          router.push(NavigationRoutes.ProjectTopics, {
            query: {
              id: data.id,
            },
          });
        }}
      />
    </AppLayout>
  );
}
