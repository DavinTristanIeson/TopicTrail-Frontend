import ProjectConfigUpdateForm from '@/modules/config/update';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import { useRouter } from 'next/router';
import React from 'react';

function UpdateProjectPageContent() {
  const router = useRouter();
  const data = React.useContext(ProjectContext);
  if (!data) return;

  return (
    <ProjectConfigUpdateForm
      data={data.config}
      onSubmit={async () => {
        router.back();
      }}
    />
  );
}

export default function UpdateProjectPage() {
  return (
    <AppProjectLayout>
      <UpdateProjectPageContent />
    </AppProjectLayout>
  );
}
