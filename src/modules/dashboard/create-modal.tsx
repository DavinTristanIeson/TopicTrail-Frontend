import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Modal } from "@mantine/core";
import React from "react";

const CreateProjectModal = React.forwardRef<
  ToggleDispatcher | undefined,
  object
>((props, ref) => {
  const [opened, setOpened] = useSetupToggleDispatcher(ref);
  return (
    <Modal
      opened={opened}
      onClose={() => {
        setOpened(false);
      }}
    ></Modal>
  );
});
CreateProjectModal.displayName = "CreateProjectModal";

export default CreateProjectModal;
