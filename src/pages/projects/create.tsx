import { useCreateProject } from '@/api/project';
import Colors from '@/common/constants/colors';
import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigForm from '@/modules/config';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateProjectPage() {
  const { mutateAsync: create } = useCreateProject();
  const router = useRouter();

  return (
    <AppLayout Header={<AppHeader title="Create New Project" />}>
      <ProjectConfigForm
        data={undefined}
        onSubmit={async (input) => {
          const res = await create(input);
          if (res.message) {
            showNotification({
              message: res.message,
              color: Colors.sentimentSuccess,
            });
          }
          router.push(NavigationRoutes.Project, {
            query: {
              id: res.data.id,
            },
          });
        }}
      />
    </AppLayout>
  );
}
