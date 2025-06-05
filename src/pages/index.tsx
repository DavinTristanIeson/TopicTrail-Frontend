import AppLayout from '@/components/layout/app';
import { Title, TextInput, Stack, Button, Text, Loader } from '@mantine/core';
import React from 'react';
import { MagnifyingGlass, Plus, Upload } from '@phosphor-icons/react';
import { useDebouncedState } from '@mantine/hooks';
import Colors from '@/common/constants/colors';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { ImportProjectModal } from '@/modules/home/import-modal.tsx';
import ProjectsListRenderer from '@/modules/home/list';
import { client } from '@/common/api/client';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import Image from 'next/image';

export default function HomePage() {
  const [q, setQ] = useDebouncedState<string | undefined>(undefined, 800);

  const router = useRouter();
  const importProjectRemote = React.useRef<DisclosureTrigger | null>(null);
  const query = client.useQuery('get', '/projects/');
  const data = query.data?.data;
  return (
    <AppLayout Header={null}>
      <ImportProjectModal ref={importProjectRemote} />
      <Stack w="100%" align="center">
        <Stack align="center" pt={64} maw={880} py={64}>
          <Image
            src="/app-icon.png"
            width={160}
            height={160}
            alt={'TopicTrail'}
          />
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
          <UseQueryWrapperComponent
            query={query}
            loadingComponent={<Loader type="dots" size={48} />}
          >
            {data && <ProjectsListRenderer q={q} data={data} />}
          </UseQueryWrapperComponent>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
