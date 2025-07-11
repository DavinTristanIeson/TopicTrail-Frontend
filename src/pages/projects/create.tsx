import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigCreateForm from '@/modules/config/create';
import React from 'react';

export default function CreateProjectPage() {
  return (
    <AppLayout Header={<AppHeader title="Create New Project" />}>
      <div className="p-4">
        <ProjectConfigCreateForm />
      </div>
    </AppLayout>
  );
}
