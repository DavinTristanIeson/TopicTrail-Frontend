import { ProjectConfigModel } from "@/api/project/config.model";
import { ProjectModel } from "@/api/project/model";
import { useGetProject } from "@/api/project/query";
import NavigationRoutes from "@/common/constants/routes";
import AppLayout from "@/components/layout/app";
import AppHeader from "@/components/layout/header";
import { AppSidebarLinkRenderer } from "@/components/layout/sidebar";
import { UseQueryWrapperComponent } from "@/components/utility/fetch-wrapper";
import { MaybeFC } from "@/components/utility/maybe";
import { ToggleDispatcher } from "@/hooks/dispatch-action";
import ProjectConfigModal from "@/modules/dashboard/config-modal/modal";
import { Divider, Stack } from "@mantine/core";
import {
  ArrowsLeftRight,
  FileMagnifyingGlass,
  Gear,
  ListMagnifyingGlass,
} from "@phosphor-icons/react";
import { useRouter } from "next/router";
import React from "react";

interface ProjectNavbarProps {
  config?: ProjectConfigModel;
}

function ProjectNavbar(props: ProjectNavbarProps) {
  const { config } = props;
  const id = useRouter().query.id as string;
  const remote = React.useRef<ToggleDispatcher | undefined>();
  return (
    <Stack>
      <AppSidebarLinkRenderer
        links={[
          {
            label: "Topics",
            icon: <FileMagnifyingGlass size={24} />,
            url: {
              pathname: NavigationRoutes.Project,
              query: {
                id,
              },
            },
          },
          // {
          //   label: "Table",
          //   icon: <Table size={24} />,
          //   url: {
          //     pathname: NavigationRoutes.ProjectTable,
          //     query: {
          //       id,
          //     },
          //   },
          // },
          {
            label: "Association",
            icon: <ArrowsLeftRight size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectAssociation,
              query: {
                id,
              },
            },
          },
          {
            label: "Evaluation",
            icon: <ListMagnifyingGlass size={24} />,
            url: {
              pathname: NavigationRoutes.ProjectEvaluation,
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
            label: "Reconfigure Project",
            icon: <Gear size={24} />,
            loading: !config,
            onClick() {
              remote.current?.open();
            },
          },
        ]}
      />
      <ProjectConfigModal ref={remote} data={config} />
    </Stack>
  );
}

interface AppProjectLayoutProps {
  children?: React.ReactNode | ((project: ProjectModel) => React.ReactNode);
}

export default function AppProjectLayout(props: AppProjectLayoutProps) {
  const id = useRouter().query.id as string;
  const query = useGetProject(
    {
      id,
    },
    {
      enabled: !!id,
    }
  );
  return (
    <AppLayout
      Header={<AppHeader back title={id} />}
      Sidebar={<ProjectNavbar config={query.data?.data.config} />}
    >
      <UseQueryWrapperComponent query={query}>
        {(data) => <MaybeFC props={data.data}>{props.children}</MaybeFC>}
      </UseQueryWrapperComponent>
    </AppLayout>
  );
}
