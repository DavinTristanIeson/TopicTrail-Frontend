import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Modal } from "@mantine/core";
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
  CreateProjectFlow_CheckDataset,
  CreateProjectFlow_CheckProjectId,
} from "./phases";
import ProjectConfigFormBody from "./form-body";
import FormWrapper from "@/components/utility/form/wrapper";
import { useUpdateProject } from "@/api/project/mutation";

interface ProjectConfigModalProps {
  data?: ProjectConfigModel;
}

function CreateProjectConfigModalBody(props: ProjectConfigModalProps) {
  const [phase, setPhase] = React.useState(0);
  const resolver = yupResolver(ProjectConfigFormSchema);
  const form = useForm({
    mode: "onChange",
    resolver,
    defaultValues: ProjectConfigDefaultValues(),
  });

  const onContinue = () => setPhase((phase) => phase + 1);
  const onBack = () => setPhase((phase) => phase - 1);

  if (phase === 0) {
    return <CreateProjectFlow_CheckProjectId onContinue={onContinue} />;
  }
  if (phase === 1) {
    return (
      <CreateProjectFlow_CheckDataset onContinue={onContinue} onBack={onBack} />
    );
  }

  return <ProjectConfigFormBody />;
}

function EditProjectConfigModalBody(props: ProjectConfigModalProps) {
  const resolver = yupResolver(ProjectConfigFormSchema);
  const form = useForm({
    mode: "onChange",
    resolver,
    defaultValues: ProjectConfigDefaultValues(),
  });
  const { mutateAsync: update } = useUpdateProject();
  const id = props.data!.projectId;
  const handleSubmit = async (values: ProjectConfigFormType) => {
    const res = await update({
      id,
      body: ProjectConfigFormType2Input(values),
    });
  };

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <ProjectConfigFormBody />
    </FormWrapper>
  );
}

const ProjectConfigModal = React.forwardRef<
  ToggleDispatcher | undefined,
  ProjectConfigModalProps
>((props, ref) => {
  const [opened, setOpened] = useSetupToggleDispatcher(ref);
  return (
    <Modal
      opened={opened}
      onClose={() => {
        setOpened(false);
      }}
      closeOnClickOutside={false}
    >
      {opened &&
        (!props.data ? (
          <CreateProjectConfigModalBody />
        ) : (
          <EditProjectConfigModalBody {...props} />
        ))}
    </Modal>
  );
});
ProjectConfigModal.displayName = "CreateProjectModal";

export default ProjectConfigModal;
