import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
} from '@/hooks/disclosure';
import { Flex, Modal } from '@mantine/core';
import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ProjectConfigDefaultValues,
  ProjectConfigFormSchema,
  ProjectConfigFormType,
  ProjectConfigFormType2Input,
} from './form-type';
import { useForm } from 'react-hook-form';
import { ProjectConfigModel } from '@/api/project/model';
import {
  ConfigureProjectFlow_CheckDataset,
  ConfigureProjectFlow_CheckProjectId,
} from './phases';
import ProjectConfigFormBody from './columns/form-body';
import FormWrapper from '@/components/utility/form/wrapper';
import { useCreateProject, useUpdateProject } from '@/api/project/mutation';
import { showNotification } from '@mantine/notifications';
import Colors from '@/common/constants/colors';
import { useRouter } from 'next/router';
import NavigationRoutes from '@/common/constants/routes';
import Button from '@/components/standard/button/base';
import { TrashSimple } from '@phosphor-icons/react';
import { DeleteProjectModal } from '../project/actions';

interface ProjectConfigModalProps {
  data?: ProjectConfigModel;
}
interface ProjectConfigModalBodyProps extends ProjectConfigModalProps {
  onClose(): void;
}

function ProjectConfigModalBody(props: ProjectConfigModalBodyProps) {
  const { data, onClose } = props;
  const [phase, setPhase] = React.useState(data ? 2 : 0);
  const resolver = yupResolver(ProjectConfigFormSchema);
  const form = useForm({
    mode: 'onChange',
    resolver,
    defaultValues: ProjectConfigDefaultValues(data),
  });

  const onContinue = () => setPhase((phase) => phase + 1);
  const onBack = () => setPhase((phase) => phase - 1);

  const { mutateAsync: create } = useCreateProject();
  const { mutateAsync: update } = useUpdateProject();
  const router = useRouter();

  const handleSubmit = async (values: ProjectConfigFormType) => {
    const input = ProjectConfigFormType2Input(values);
    const res = data
      ? await update({
          id: data.projectId,
          body: input,
        })
      : await create(input);

    if (res.message) {
      showNotification({
        color: Colors.sentimentSuccess,
        message: res.message,
      });
    }

    onClose();
    if (!data) {
      router.push({
        pathname: NavigationRoutes.Project,
        query: {
          id: res.data.id,
        },
      });
    }
  };

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      {phase === 0 && (
        <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
      )}
      {phase === 1 && (
        <ConfigureProjectFlow_CheckDataset
          onContinue={onContinue}
          onBack={onBack}
          hasData={!!data}
        />
      )}
      {phase === 2 && <ProjectConfigFormBody onBack={onBack} />}
    </FormWrapper>
  );
}

function ProjectConfigModalHeader(props: ProjectConfigModalProps) {
  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<string> | null>(null);
  const router = useRouter();
  const { data } = props;
  if (!data) return;
  return (
    <>
      <DeleteProjectModal
        ref={deleteRemote}
        onAfterDelete={() => {
          router.replace(NavigationRoutes.Project, {
            query: {
              id: data.projectId,
            },
          });
        }}
      />
      <Modal.Header>
        <Flex direction="row-reverse" w="100%">
          <Button
            variant="outline"
            leftSection={<TrashSimple />}
            color={Colors.sentimentError}
            onClick={() => {
              close();
              deleteRemote.current?.open(data.projectId);
            }}
          >
            Delete Project
          </Button>
        </Flex>
      </Modal.Header>
    </>
  );
}

const ProjectConfigModal = React.forwardRef<
  DisclosureTrigger | null,
  ProjectConfigModalProps
>((props, ref) => {
  const [opened, { close }] = useDisclosureTrigger(ref);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={1200}
        centered
        closeOnClickOutside={false}
      >
        <ProjectConfigModalHeader {...props} />
        <Modal.Body>
          {opened && <ProjectConfigModalBody {...props} onClose={close} />}
        </Modal.Body>
      </Modal>
    </>
  );
});
ProjectConfigModal.displayName = 'CreateProjectModal';

export default ProjectConfigModal;
