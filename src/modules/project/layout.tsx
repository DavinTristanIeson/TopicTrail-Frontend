import { ProjectConfigModel } from '@/api/project';
import { useGetProject } from '@/api/project/query';
import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import { AppSidebarLinkRenderer } from '@/components/layout/sidebar';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { DisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigModal from '@/modules/config-modal';
import { Divider, Stack } from '@mantine/core';
import {
  ArrowsLeftRight,
  FileMagnifyingGlass,
  Gear,
  GitDiff,
  Table,
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import { ProjectContext } from './context';

interface ProjectNavbarProps {
  config?: ProjectConfigModel;
}

function ProjectNavbar(props: ProjectNavbarProps) {
  const { config } = props;
  const id = useRouter().query.id as string;
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <Stack>
      <AppSidebarLinkRenderer
        links={[
          {
            label: 'Topics',
            icon: <FileMagnifyingGlass size={24} />,
            url: {
              pathname: NavigationRoutes.Project,
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
            label: 'Reconfigure Project',
            icon: <Gear size={24} />,
            loading: !config,
            onClick() {
              remote.current?.open();
            },
          },
          {
            label: 'Help',
            icon: <Gear size={24} />,
            url: {
              pathname: NavigationRoutes.Help,
            },
          },
        ]}
      />
      <ProjectConfigModal ref={remote} data={config} />
    </Stack>
  );
}

interface AppProjectLayoutProps {
  children?: React.ReactNode;
}

export default function AppProjectLayout(props: AppProjectLayoutProps) {
  const id = useRouter().query.id as string;
  const query = useGetProject(
    {
      id,
    },
    {
      enabled: !!id,
    },
  );
  return (
    <AppLayout
      Header={<AppHeader back title={id} />}
      Sidebar={<ProjectNavbar config={query.data?.data.config} />}
    >
      <UseQueryWrapperComponent query={query}>
        <ProjectContext.Provider value={query.data?.data}>
          {props.children}
        </ProjectContext.Provider>
      </UseQueryWrapperComponent>
    </AppLayout>
  );
}
