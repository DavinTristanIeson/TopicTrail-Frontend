import { useGetProjects } from "@/api/project/query";
import AppLayout from "@/components/layout/app";
import AppSidebar, { AppNavigationLink } from "@/components/layout/sidebar";
import { Title, Flex, Box, Loader, TextInput } from "@mantine/core";
import Text from "@/components/standard/text";
import React from "react";
import { maybeElement } from "@/common/utils/iterable";
import { Plus } from "@phosphor-icons/react";
import { useDebouncedState } from "@mantine/hooks";
import ProjectConfigModal from "@/modules/dashboard/config-modal/modal";
import { ToggleDispatcher } from "@/hooks/dispatch-action";

export default function Dashboard() {
  const [q, setQ] = useDebouncedState<string | undefined>(undefined, 800);

  const { isFetching, data } = useGetProjects();

  const remote = React.useRef<ToggleDispatcher | undefined>();
  const projects: AppNavigationLink[] =
    data?.data
      .filter((project) => project.id === q)
      .map((project) => {
        return {
          key: project.id,
          label: project.id,
        };
      }) ?? [];

  return (
    <AppLayout
      Aside={
        <AppSidebar
          links={[
            {
              key: "projects",
              label: "Your Projects",
              children: [
                {
                  key: "search",
                  label: (
                    <TextInput
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search Project"
                    />
                  ),
                },
                ...maybeElement(isFetching, {
                  key: "loading",
                  label: (
                    <Flex align="center">
                      <Loader />
                      <Text>Loading projects....</Text>
                    </Flex>
                  ),
                }),
                {
                  key: "create",
                  onClick() {
                    remote.current?.open();
                  },
                  label: "Create Project",
                  icon: <Plus size={24} />,
                },
                ...projects,
              ],
            },
          ]}
        />
      }
    >
      <ProjectConfigModal ref={remote} />
      <Box>
        <Flex align="center" justify="center" w="100%" h="100%">
          <Title order={2}>Choose a Project!</Title>
          <Text>
            Looks like you haven&apos;t opened any projects yet. Pick a project
            or create a new project from the side bar to get started.
          </Text>
        </Flex>
      </Box>
    </AppLayout>
  );
}
