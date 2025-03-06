import {
  useCreateProject,
  useGetProject,
  useUpdateProject,
  useUpdateProjectColumns,
} from '@/api/project';
import Colors from '@/common/constants/colors';
import NavigationRoutes from '@/common/constants/routes';
import AppLayout from '@/components/layout/app';
import AppHeader from '@/components/layout/header';
import Text from '@/components/standard/text';
import ConfirmationDialog from '@/components/widgets/confirmation';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config';
import { DeleteProjectModal } from '@/modules/project/actions';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import {
  Alert,
  Button,
  Divider,
  Group,
  Menu,
  Popover,
  Switch,
  Tooltip,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  Info,
  Lock,
  LockOpen,
  PencilSimple,
  TrashSimple,
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

function UpdateProjectFull() {
  const { mutateAsync: update } = useUpdateProject();
  const router = useRouter();
  return (
    <ProjectConfigForm
      data={undefined}
      onSubmit={async (input) => {
        const res = await update({
          id: router.query.id as string,
          body: input,
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: Colors.sentimentSuccess,
          });
        }
        router.back();
      }}
    />
  );
}

function UpdateProjectLimited() {
  const { mutateAsync: updateColumns } = useUpdateProjectColumns();
  const router = useRouter();
  return (
    <ProjectConfigForm
      data={undefined}
      onSubmit={async (input) => {
        const res = await updateColumns({
          id: router.query.id as string,
          body: { columns: input.dataSchema.columns },
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: Colors.sentimentSuccess,
          });
        }
        router.back();
      }}
    />
  );
}

function UpdateProjectDeleteButton() {
  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<string> | null>(null);
  const router = useRouter();
  const project = React.useContext(ProjectContext);
  return (
    <>
      <DeleteProjectModal
        ref={deleteRemote}
        onAfterDelete={() => {
          router.replace(NavigationRoutes.Dashboard);
        }}
      />
      <Button
        variant="outline"
        leftSection={<TrashSimple />}
        color={Colors.sentimentError}
        onClick={() => {
          if (!project?.id) return;
          deleteRemote.current?.open(project.id);
        }}
      >
        Delete Project
      </Button>
    </>
  );
}

interface UpdateProjectEditButtonProps {
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
  setColumnsOnly: React.Dispatch<React.SetStateAction<boolean>>;
  onChangeProjectId(): void;
}

function UpdateProjectEditButton(props: UpdateProjectEditButtonProps) {
  const { setEditable, setColumnsOnly, onChangeProjectId } = props;
  return (
    <Menu>
      <Menu.Target>
        <Button leftSection={<PencilSimple size={16} />}>Edit</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            setEditable(true);
          }}
        >
          Reconfigure Columns
        </Menu.Item>
        <Menu.Item onClick={onChangeProjectId}>Change Project ID</Menu.Item>
        <Menu.Divider />
        <Menu.Label>
          Dangerous
          <Tooltip label="This will cause cached objects such as document vectors and topic modeling results to be deleted; which means that you will have to run the topic modeling procedure again if you have already run it before.">
            <Info color={Colors.sentimentError} />
          </Tooltip>
        </Menu.Label>
        <Menu.Item
          onClick={() => {
            setEditable(true);
            setColumnsOnly(true);
          }}
        >
          Change Dataset
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function UpdateProjectId

function UpdateProjectPageContent() {
  const [columnsOnly, setColumnsOnly] = React.useState(false);
  const [editable, setEditable] = React.useState(false);

  return (
    <>
      <Group justify="end">
        {!editable && (
          <>
            <UpdateProjectEditButton
              onChangeProjectId={() => {}}
              setColumnsOnly={setColumnsOnly}
              setEditable={setEditable}
            />
            <UpdateProjectDeleteButton />
          </>
        )}
      </Group>
      {columnsOnly && (
        <Alert
          color={columnsOnly ? Colors.sentimentInfo : Colors.sentimentError}
        >
          <Group gap={4}>
            {columnsOnly ? <Lock size={24} /> : <LockOpen size={24} />}
            <Text>
              {columnsOnly
                ? 'Right now, you can only update the column configurations. Other fields such as column types, dataset, and project ID cannot be updated.'
                : ''}
            </Text>
            <Switch checked={!columnsOnly} label="Update everything?" />
          </Group>
        </Alert>
      )}
      <Divider />
    </>
  );
}

export default function UpdateProjectPage() {
  return (
    <AppProjectLayout>
      <UpdateProjectPageContent />
    </AppProjectLayout>
  );
}
