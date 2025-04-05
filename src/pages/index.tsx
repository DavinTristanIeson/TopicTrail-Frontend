import AppLayout from '@/components/layout/app';
import { Title, TextInput, Stack, Loader, Button, Text } from '@mantine/core';
import React from 'react';
import { MagnifyingGlass, Plus, Upload } from '@phosphor-icons/react';
import { useDebouncedState } from '@mantine/hooks';
import Colors from '@/common/constants/colors';
import AppHeader from '@/components/layout/header';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { ImportProjectModal, ProjectListItem } from '@/modules/project/actions';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { client } from '@/common/api/client';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { ProjectModel } from '@/api/project';

interface ProjectsListRendererProps {
  q: string | undefined;
}

function ProjectsListRenderer(props: ProjectsListRendererProps) {
  const { q } = props;
  const query = client.useQuery('get', '/projects/');
  return (
    <UseQueryWrapperComponent
      query={query}
      loadingComponent={<Loader type="dots" size={48} />}
    >
      {(data) => {
        const fullProjects = data.data;
        let projects: ProjectModel[];
        if (q) {
          const indices = filterByString(
            q,
            fullProjects.map((project) => {
              return {
                name: project.config.metadata.name,
                tags: project.config.metadata.tags,
              };
            }),
          );
          projects = pickArrayByIndex(fullProjects, indices);
        } else {
          projects = fullProjects;
        }
        return (
          <ul className="flex flex-col gap-2 w-full">
            {projects.map((project) => (
              <ProjectListItem key={project.id} {...project} />
            ))}
          </ul>
        );
      }}
    </UseQueryWrapperComponent>
  );
}

export default function HomePage() {
  const [q, setQ] = useDebouncedState<string | undefined>(undefined, 800);

  const router = useRouter();
  const importProjectRemote = React.useRef<DisclosureTrigger | null>(null);

  return (
    <AppLayout Header={<AppHeader />}>
      <ImportProjectModal ref={importProjectRemote} />
      <Stack w="100%" align="center">
        <Stack align="center" pt={64} maw={880} py={64}>
          <Title order={2}>Choose a Project!</Title>
          <Text className="text-wrap break-words" ta="center">
            Looks like you haven&apos;t opened any projects yet. Pick a project
            from below or create a new project to get started.
          </Text>
          <Stack align="center" gap={8} w="100%">
            <TextInput
              onChange={(e) => setQ(e.target.value)}
              leftSection={<MagnifyingGlass color={Colors.foregroundDull} />}
              placeholder="Search Project"
              w="100%"
            />
            <Text size="sm">alternatively, you can </Text>
            <Button
              leftSection={<Plus />}
              fullWidth
              onClick={() => {
                router.push(NavigationRoutes.ProjectCreate);
              }}
            >
              Create New Project
            </Button>
            <Text size="sm">or</Text>
            <Button
              leftSection={<Upload />}
              variant="outline"
              fullWidth
              onClick={() => {
                importProjectRemote.current?.open();
              }}
            >
              Import a Project
            </Button>
          </Stack>
          <ProjectsListRenderer q={q} />
        </Stack>
      </Stack>
    </AppLayout>
  );
}
