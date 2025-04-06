import {
  Paper,
  Group,
  ActionIcon,
  Modal,
  Stack,
  Flex,
  Button,
  Badge,
  Text,
  FileInput,
  JsonInput,
  Switch,
  Alert,
} from '@mantine/core';
import React from 'react';
import {
  Eye,
  Folder,
  Info,
  PencilSimple,
  TrashSimple,
  X,
} from '@phosphor-icons/react';
import {
  ProjectModel,
  ProjectMutationInput,
  removeProjectDependencyQueries,
} from '@/api/project';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import { handleErrorFn } from '@/common/utils/error';
import { showNotification } from '@mantine/notifications';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { client } from '@/common/api/client';
import { queryClient } from '@/common/api/query-client';

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

interface DeleteProjectModalProps {
  onAfterDelete?(): void;
  projectId: string;
  projectName: string;
}
export const DeleteProjectModal = React.forwardRef<
  DisclosureTrigger | null,
  DeleteProjectModalProps
>(function DeleteProjectModal(props, ref) {
  const { onAfterDelete, projectId, projectName } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);
  const { mutateAsync, isPending } = client.useMutation(
    'delete',
    '/projects/{project_id}',
    {
      onSuccess(data, variables) {
        removeProjectDependencyQueries(variables.params.path.project_id);
      },
    },
  );
  return (
    <Modal opened={opened} onClose={close} title="Delete Project" centered>
      {projectId && (
        <Stack gap={32}>
          <Text>
            Are you sure you want to delete{' '}
            <Text fw="bold" span>
              {projectName}
            </Text>
            ?{' '}
            <Text fw="bold" span c="red">
              This action is irreversible!
            </Text>
          </Text>
          <Flex direction="row-reverse" gap={12}>
            <Button
              color="red"
              leftSection={<TrashSimple />}
              loading={isPending}
              onClick={handleErrorFn(async () => {
                const res = await mutateAsync({
                  params: {
                    path: {
                      project_id: projectId,
                    },
                  },
                });
                if (res.message) {
                  showNotification({
                    message: res.message,
                    color: 'green',
                  });
                }
                onAfterDelete?.();
                close();
              })}
            >
              Delete Project
            </Button>
            <Button
              variant="outline"
              color="gray"
              leftSection={<X />}
              onClick={close}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      )}
    </Modal>
  );
});

async function readFile(file: File) {
  const fileReader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    fileReader.onloadend = () => {
      resolve(fileReader.result as string);
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
    fileReader.onabort = () => {
      reject(fileReader.error);
    };
    fileReader.readAsText(file);
  });
}

function tryParseConfigJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (e: any) {
    console.error(e);
    showNotification({
      message: `Invalid configuration file.${e.message ? ` Reason: ${e.message}` : ''}`,
      color: 'red',
    });
    return null;
  }
}

export const ImportProjectModal = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function ImportProjectModal(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const [file, setFile] = React.useState<File | null>(null);
  const [json, setJson] = React.useState<string | null>(null);
  const [fileMode, setFileMode] = React.useState<boolean>(true);

  const {
    mutateAsync: createProject,
    error,
    isPending,
  } = client.useMutation('post', '/projects/', {
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: client.queryOptions('get', '/projects/').queryKey,
      });
    },
  });
  const router = useRouter();

  const onImport = handleErrorFn(async () => {
    let jsonContents: any = undefined;
    if (fileMode) {
      if (!file) return;
      const fileContents = await readFile(file);
      jsonContents = tryParseConfigJson(fileContents);
    } else {
      if (!json) return;
      jsonContents = tryParseConfigJson(json);
    }
    if (!jsonContents) {
      return;
    }
    const res = await createProject({
      body: jsonContents as ProjectMutationInput,
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: 'green',
      });
    }
    router.push({
      pathname: NavigationRoutes.ProjectTopics,
      query: {
        id: res.data.id,
      },
    });
    close();
  });
  return (
    <Modal opened={opened} onClose={close} title="Import Project">
      <Stack>
        <Alert title="What is this for?" icon={<Info />}>
          If you already have a project in another device, you can easily port
          it over to this device by uploading the file or pasting the contents
          in the provided fields.
        </Alert>
        <Switch
          checked={fileMode}
          onChange={(e) => setFileMode(e.target.checked)}
          label={fileMode ? 'Import with File' : 'Import with JSON'}
          description={
            fileMode
              ? `Upload the config file in the provided field and then press the "Import" button.`
              : `Copy the contents of the config file in the provided field and then press the "Import" button.`
          }
        />
        {error && (
          <Alert title="Failed Import">
            We weren&apos;t able to import the provided project successfully due
            to the following reasons:
            <br />
            {error.message}
            <br />
            {error.errors && JSON.stringify(error.errors)}
          </Alert>
        )}
        {fileMode && (
          <FileInput
            label="Config File"
            onChange={setFile}
            leftSection={<Folder />}
            placeholder="Click here to choose a file from your file explorer."
          />
        )}
        {!fileMode && (
          <JsonInput
            label="Config File (in JSON)"
            placeholder="Put the contents of the config file here."
            formatOnBlur
            onChange={setJson}
            rows={14}
          />
        )}
        <Group justify="end">
          <Button
            onClick={onImport}
            loading={isPending}
            disabled={fileMode ? !file : !json}
          >
            Import Project
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
});
