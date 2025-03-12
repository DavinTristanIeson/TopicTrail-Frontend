import AppLayout from '@/components/layout/app';
import { Title, TextInput, Stack, Loader, Button } from '@mantine/core';
import Text from '@/components/standard/text';
import React from 'react';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { useDebouncedState } from '@mantine/hooks';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import Colors from '@/common/constants/colors';
import AppHeader from '@/components/layout/header';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { DeleteProjectModal, ProjectListItem } from '@/modules/project/actions';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { client } from '@/common/api/client';

export default function Dashboard() {
  const [q, setQ] = useDebouncedState<string | undefined>(undefined, 800);
  const query = client.useQuery('get', '/projects/');
  const router = useRouter();

  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<string> | null>(null);

  const onDelete = React.useCallback((id: string) => {
    deleteRemote.current?.open(id);
  }, []);

  return (
    <AppLayout Header={<AppHeader />}>
      <DeleteProjectModal ref={deleteRemote} />
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
                router.push(NavigationRoutes.ProjectCreate);
              }}
            >
              Create New Project
            </Button>
          </Stack>
          <UseQueryWrapperComponent
            query={query}
            loadingComponent={<Loader type="dots" size={48} />}
          >
            {(data) => {
              const projects =
                q == null
                  ? data.data
                  : data.data.filter((project) => {
                      const meta = project.config.metadata;
                      return meta.name.includes(q) || !!meta.tags?.includes(q);
                    });
              return (
                <ul className="flex flex-col gap-2 w-full">
                  {projects.map((project) => (
                    <ProjectListItem key={project.id} {...project} />
                  ))}
                </ul>
              );
            }}
          </UseQueryWrapperComponent>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
