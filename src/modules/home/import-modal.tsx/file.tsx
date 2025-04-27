import { showNotification } from '@mantine/notifications';
import { ImportProjectFormComponentProps } from './import-action';
import React from 'react';
import { FileInput } from '@mantine/core';
import { Folder } from '@phosphor-icons/react';
import { ProjectMutationInput } from '@/api/project';

export async function readFileAsText(file: File) {
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

export function tryParseProjectConfigJson(json: string) {
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

export default function ImportProjectModalFileModeComponent(
  props: ImportProjectFormComponentProps,
) {
  const [file, setFile] = React.useState<File | null>(null);
  const { ImportButton } = props;
  return (
    <>
      <FileInput
        label="Config File"
        onChange={setFile}
        leftSection={<Folder />}
        placeholder="Click here to choose a file from your file explorer."
      />
      <ImportButton
        disabled={!file}
        getImportPayload={async () => {
          if (!file) return;
          const fileContents = await readFileAsText(file);
          return tryParseProjectConfigJson(
            fileContents,
          ) as ProjectMutationInput;
        }}
      />
    </>
  );
}
