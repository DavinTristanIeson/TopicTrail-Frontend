import { useUpdateProject, useUpdateProjectColumns } from '@/api/project';
import NavigationRoutes from '@/common/constants/routes';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import ProjectConfigForm from '@/modules/config';
import { DeleteProjectModal } from '@/modules/project/actions';
import { ProjectContext } from '@/modules/project/context';
import AppProjectLayout from '@/modules/project/layout';
import { Button, Divider, Group, Menu, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Info, PencilSimple, TrashSimple, X } from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';

interface UpdateProjectFormProps {
  editable: boolean;
}

function UpdateProjectFull(props: UpdateProjectFormProps) {
  const { mutateAsync: update } = useUpdateProject();
  const router = useRouter();
  return (
    <ProjectConfigForm
      data={undefined}
      editable={props.editable}
      onSubmit={async (input) => {
        const res = await update({
          id: router.query.id as string,
          body: input,
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: 'green',
          });
        }
        router.back();
      }}
    />
  );
}

function UpdateProjectLimited(props: UpdateProjectFormProps) {
  const { mutateAsync: updateColumns } = useUpdateProjectColumns();
  const router = useRouter();
  return (
    <ProjectConfigForm
      data={undefined}
      editable={props.editable}
      onSubmit={async (input) => {
        const res = await updateColumns({
          id: router.query.id as string,
          body: { columns: input.dataSchema.columns },
        });
        if (res.message) {
          showNotification({
            message: res.message,
            color: 'green',
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
        color="red"
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
          <Tooltip
            label="This will cause cached objects such as document vectors and topic modeling results to be deleted; which means that you will have to run the topic modeling procedure again if you have already run it before."
            color="red"
          >
            <Info color="red" />
          </Tooltip>
        </Menu.Label>
        <Menu.Item
          onClick={() => {
            setEditable(true);
            setColumnsOnly(false);
          }}
        >
          Change Dataset
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function UpdateProjectPageContent() {
  const [columnsOnly, setColumnsOnly] = React.useState(false);
  const [editable, setEditable] = React.useState(false);

  return (
    <>
      <Group justify="end">
        {!editable ? (
          <>
            <UpdateProjectEditButton
              onChangeProjectId={() => {}}
              setColumnsOnly={setColumnsOnly}
              setEditable={setEditable}
            />
            <UpdateProjectDeleteButton />
          </>
        ) : (
          <Button
            variant="outline"
            color="red"
            leftSection={<X />}
            onClick={() => {
              setColumnsOnly(true);
              setEditable(false);
            }}
          >
            Cancel
          </Button>
        )}
      </Group>
      <Divider />
      {columnsOnly ? (
        <UpdateProjectLimited editable={editable} />
      ) : (
        <UpdateProjectFull editable={editable} />
      )}
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
