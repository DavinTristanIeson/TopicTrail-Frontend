import { useGetProjects } from "@/api/project/query";
import AppLayout from "@/components/layout/app";
import { Title, TextInput, Stack, Burger, Paper, Loader } from "@mantine/core";
import Text from "@/components/standard/text";
import React from "react";
import { Eye, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useDebouncedState } from "@mantine/hooks";
import ProjectConfigModal from "@/modules/dashboard/config-modal/modal";
import { ToggleDispatcher } from "@/hooks/dispatch-action";
import Colors from "@/common/constants/colors";
import AppHeader from "@/components/layout/header";
import Button from "@/components/standard/button/base";
import { UseQueryWrapperComponent } from "@/components/utility/fetch-wrapper";
import { ProjectLiteModel } from "@/api/project/model";
import { useRouter } from "next/router";
import NavigationRoutes from "@/common/constants/routes";

function ProjectListItem(props: ProjectLiteModel) {
  const router = useRouter();
  return (
    <Paper
      shadow="xs"
      w="100%"
      p="md"
      className="flex justify-between align-start hover:bg-gray-50 cursor-pointer"
      onClick={() => {
        router.push({
          pathname: NavigationRoutes.Project,
          query: {
            id: props.id,
          },
        });
      }}
    >
      <div>
        <Text>{props.id}</Text>
        <Text c={Colors.foregroundDull}>{`from data/${props.id}`}</Text>
      </div>
      <Eye size={24} color={Colors.foregroundPrimary} />
    </Paper>
  );
}

export default function Dashboard() {
  const [q, setQ] = useDebouncedState<string | undefined>(undefined, 800);
  const query = useGetProjects();

  const remote = React.useRef<ToggleDispatcher | undefined>();

  return (
    <AppLayout Header={<AppHeader />}>
      <ProjectConfigModal ref={remote} />
      <Stack w="100%" align="center">
        <Stack align="center" pt={64} maw={880} py={64}>
          <Title order={2}>Choose a Project!</Title>
          <Text wrap ta="center">
            Looks like you haven&apos;t opened any projects yet. Pick a project
            from below or create a new project to get started.
          </Text>
          <Stack align="center" gap={8} w="100%">
            <TextInput
              onChange={(e) => setQ(e.target.value)}
              leftSection={
                <MagnifyingGlass size={16} color={Colors.foregroundDull} />
              }
              placeholder="Search Project"
              w="100%"
            />
            <Text size="sm">alternatively, you can </Text>
            <Button
              leftSection={<Plus size={16} />}
              fullWidth
              onClick={() => {
                remote.current?.open();
              }}
            >
              Create New Project
            </Button>
          </Stack>
          <UseQueryWrapperComponent
            query={query}
            loadingComponent={<Loader type="dots" size={48} />}
          >
            {(data) => (
              <ul className="flex flex-col gap-2 w-full">
                {data.data
                  .filter((project) =>
                    q == null ? true : project.id.includes(q)
                  )
                  .map((project) => (
                    <ProjectListItem key={project.id} {...project} />
                  ))}
              </ul>
            )}
          </UseQueryWrapperComponent>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
