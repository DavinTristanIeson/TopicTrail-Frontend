import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import ProjectConfigCreateForm from '@/modules/config/create';
import { Button } from '@mantine/core';
import { DoorOpen } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

export default function CreateProjectPage() {
  const { back } = useRouter();
  return (
    <AppLayout
      Header={
        <AppHeader
          title="Create New Project"
          Right={
            <>
              <div className="flex-1"></div>
              <Button
                leftSection={<DoorOpen />}
                onClick={() => back()}
                variant="outline"
              >
                Return
              </Button>
            </>
          }
        />
      }
    >
      <div className="p-4">
        <ProjectConfigCreateForm />
      </div>
    </AppLayout>
  );
}
