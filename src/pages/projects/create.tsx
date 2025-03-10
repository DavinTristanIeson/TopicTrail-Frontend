import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';
import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigForm from '@/modules/config';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateProjectPage() {
  const { mutateAsync: create } = client.useMutation('post', '/projects/', {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries();
    },
  });
  const router = useRouter();

  return (
    <AppLayout Header={<AppHeader title="Create New Project" />}>
      <ProjectConfigForm
        data={undefined}
        editable
        columnsOnly={false}
        onSubmit={async (input) => {
          const res = await create({
            body: input,
          });
          if (res.message) {
            showNotification({
              message: res.message,
              color: 'green',
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
