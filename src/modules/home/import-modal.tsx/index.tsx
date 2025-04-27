import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Modal, Stack, Alert, Switch } from '@mantine/core';
import { Info, Warning } from '@phosphor-icons/react';
import React from 'react';
import ImportProjectModalFileModeComponent from './file';
import ImportProjectModalJsonModeComponent from './json';
import { useDefaultImportProjectSubmitButton } from './import-action';

export const ImportProjectModal = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function ImportProjectModal(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const [fileMode, setFileMode] = React.useState<boolean>(true);
  const { ImportButton, error } = useDefaultImportProjectSubmitButton({
    onClose: close,
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
          <Alert
            title="Failed to import project"
            color="red"
            icon={<Warning />}
          >
            We weren&apos;t able to import the provided project due to the
            following reasons:
            <br />
            {error.message}
            <br />
            {error.errors && JSON.stringify(error.errors)}
          </Alert>
        )}
        {fileMode && opened && (
          <ImportProjectModalFileModeComponent ImportButton={ImportButton} />
        )}
        {!fileMode && opened && (
          <ImportProjectModalJsonModeComponent ImportButton={ImportButton} />
        )}
      </Stack>
    </Modal>
  );
});
