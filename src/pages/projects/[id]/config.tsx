import ProjectConfigUpdateForm from '@/modules/config/update';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import React from 'react';

function UpdateProjectPageContent() {
  const data = React.useContext(ProjectContext);
  if (!data) return;

  return <ProjectConfigUpdateForm data={data.config} />;
}

export default function UpdateProjectPage() {
  return (
    <AppProjectLayout>
      <UpdateProjectPageContent />
    </AppProjectLayout>
  );
}
