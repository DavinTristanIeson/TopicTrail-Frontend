import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Flex, Modal } from "@mantine/core";
import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ProjectConfigDefaultValues,
  ProjectConfigFormSchema,
  ProjectConfigFormType,
  ProjectConfigFormType2Input,
} from "./form-type";
import { useForm } from "react-hook-form";
import { ProjectConfigModel } from "@/api/project/config.model";
import {
  ConfigureProjectFlow_CheckDataset,
  ConfigureProjectFlow_CheckProjectId,
} from "./phases";
import ProjectConfigFormBody from "./form-body";
import FormWrapper from "@/components/utility/form/wrapper";
import { useCreateProject, useUpdateProject } from "@/api/project/mutation";
import { showNotification } from "@mantine/notifications";
import Colors from "@/common/constants/colors";
import { handleFormSubmission } from "@/common/utils/form";
import { useRouter } from "next/router";
import NavigationRoutes from "@/common/constants/routes";
import Button from "@/components/standard/button/base";
import { TrashSimple } from "@phosphor-icons/react";
import { DeleteProjectModal } from "../project-management";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";

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
    mode: "onChange",
    resolver,
    defaultValues: ProjectConfigDefaultValues(data),
  });

  const onContinue = () => setPhase((phase) => phase + 1);
  const onBack = () => setPhase((phase) => phase - 1);

  const { mutateAsync: create } = useCreateProject();
  const { mutateAsync: update } = useUpdateProject();
  const router = useRouter();

  const handleSubmit = handleFormSubmission(
    async (values: ProjectConfigFormType) => {
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
    },
    (name, error) => {
      const errorName = name
        .split(".")
        .filter(
          (section) =>
            !Object.values(SchemaColumnTypeEnum).includes(section as any)
        )
        .join(".");
      form.setError(errorName as any, error);
    }
  );

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

const ProjectConfigModal = React.forwardRef<
  ToggleDispatcher | undefined,
  ProjectConfigModalProps
>((props, ref) => {
  const [opened, setOpened] = useSetupToggleDispatcher(ref);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();
  const data = props.data;
  return (
    <>
      {data && (
        <DeleteProjectModal
          project={isDeleting ? data.projectId : undefined}
          onClose={() => setIsDeleting(false)}
          onDelete={() => {
            router.replace(NavigationRoutes.Project, {
              query: {
                id: data.projectId,
              },
            });
          }}
        />
      )}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
        }}
        size={1200}
        centered
        closeOnClickOutside={false}
      >
        {props.data && (
          <Modal.Header>
            <Flex direction="row-reverse" w="100%">
              <Button
                variant="outline"
                leftSection={<TrashSimple />}
                color={Colors.sentimentError}
                onClick={() => {
                  setOpened(false);
                  setIsDeleting(true);
                }}
              >
                Delete Project
              </Button>
            </Flex>
          </Modal.Header>
        )}
        <Modal.Body>
          {opened && (
            <ProjectConfigModalBody
              {...props}
              onClose={() => setOpened(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
});
ProjectConfigModal.displayName = "CreateProjectModal";

export default ProjectConfigModal;
