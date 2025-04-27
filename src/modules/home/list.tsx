import { ProjectModel } from '@/api/project';
import NavigationRoutes from '@/common/constants/routes';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import { Paper, Group, Badge, ActionIcon, Text } from '@mantine/core';
import { Eye, PencilSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/router';

export function ProjectListItem(props: ProjectModel) {
  const router = useRouter();
  const metadata = props.config.metadata;
  return (
    <Paper shadow="xs" p="md" className="w-full">
      <div>
        <Group justify="between">
          <div className="flex-1">
            <Text fw="500">{metadata.name}</Text>
            <Text
              c="gray"
              className="text-wrap"
              size="sm"
            >{`from ${props.path}`}</Text>
            <Group wrap="wrap" gap={4} className="pt-2">
              {metadata.tags?.map((tag) => (
                <Badge color="brand" variant="light" radius="sm" key={tag}>
                  {tag}
                </Badge>
              ))}
            </Group>
          </div>
          <Group gap={12}>
            <ActionIcon
              variant="subtle"
              size="lg"
              color="brand"
              onClick={() => {
                router.push({
                  pathname: NavigationRoutes.ProjectTopics,
                  query: {
                    id: props.id,
                  },
                });
              }}
            >
              <Eye size={24} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              onClick={() => {
                router.push({
                  pathname: NavigationRoutes.ProjectConfiguration,
                  query: {
                    id: props.id,
                  },
                });
              }}
              size="lg"
            >
              <PencilSimple size={24} />
            </ActionIcon>
          </Group>
        </Group>
        {!!metadata.description && (
          <Text size="sm" className="pt-2 whitespace-pre-wrap">
            {metadata.description}
          </Text>
        )}
      </div>
    </Paper>
  );
}

interface ProjectsListRendererProps {
  data: ProjectModel[];
  q: string | undefined;
}

export default function ProjectsListRenderer(props: ProjectsListRendererProps) {
  const { data: fullProjects, q } = props;
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
}
