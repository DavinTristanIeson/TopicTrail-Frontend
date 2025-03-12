import { ProjectConfigModel } from '@/api/project';
import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import { AppSidebarLinkRenderer } from '@/components/layout/sidebar';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { Divider, Stack } from '@mantine/core';
import {
  ArrowsLeftRight,
  DoorOpen,
  FileMagnifyingGlass,
  Gear,
  GitDiff,
  Table,
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { ProjectContext } from './context';
import { client } from '@/common/api/client';
import ConfirmationDialog from '@/components/widgets/confirmation';

interface ProjectNavbarProps {
  config?: ProjectConfigModel;
}

function ProjectNavbar(props: ProjectNavbarProps) {
  const { config } = props;
  const id = useRouter().query.id as string;
  const router = useRouter();
  const confirmRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <Stack>
      <ConfirmationDialog
        message="Are you sure you want to go back? This will abort the project creation process and all of the values you inputted will be lost."
        onConfirm={async () => {
          router.back();
        }}
        positiveAction="Go Back"
        ref={confirmRemote}
      />
      <AppSidebarLinkRenderer
        links={[
          {
            label: 'Go Back',
            icon: <DoorOpen size={24} />,
            onClick() {
              confirmRemote.current?.open();
            },
          },
        ]}
      />
      <Divider />
      <AppSidebarLinkRenderer
        links={[
          {
            label: 'Topics',
            icon: <FileMagnifyingGlass size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectTopics,
              query: {
                id,
              },
            },
          },
          {
            label: 'Table',
            icon: <Table size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectTable,
              query: {
                id,
              },
            },
          },
          {
            label: 'Comparison',
            icon: <GitDiff size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectComparison,
              query: {
                id,
              },
            },
          },
          {
            label: 'Topic Correlation',
            icon: <ArrowsLeftRight size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectTopicCorrelation,
              query: {
                id,
              },
            },
          },
        ]}
      />
      <Divider />
      <AppSidebarLinkRenderer
        links={[
          {
            label: 'Configuration',
            icon: <Gear size={24} />,
            loading: !config,
            url: {
              pathname: NavigationRoutes.ProjectConfiguration,
              query: {
                id,
              },
            },
          },
        ]}
      />
    </Stack>
  );
}

interface AppProjectLayoutProps {
  children?: React.ReactNode;
}

export default function AppProjectLayout(props: AppProjectLayoutProps) {
  const { children } = props;
  const id = useRouter().query.id as string;
  const query = client.useQuery(
    'get',
    '/projects/{project_id}',
    {
      params: {
        path: {
          project_id: id,
        },
      },
    },
    {
      enabled: !!id,
    },
  );
  return (
    <AppLayout
      Header={<AppHeader title={query.data?.data.config.metadata.name} />}
      Sidebar={<ProjectNavbar config={query.data?.data.config} />}
    >
      <UseQueryWrapperComponent query={query}>
        <ProjectContext.Provider value={query.data?.data}>
          {children}
        </ProjectContext.Provider>
      </UseQueryWrapperComponent>
    </AppLayout>
  );
}
