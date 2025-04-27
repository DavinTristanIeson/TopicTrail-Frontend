import { JsonInput } from '@mantine/core';
import { ImportProjectFormComponentProps } from './import-action';
import React from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { tryParseProjectConfigJson } from './file';

export default function ImportProjectModalJsonModeComponent(
  props: ImportProjectFormComponentProps,
) {
  const { ImportButton } = props;
  const [json, setJson] = React.useState('');
  const [debouncedJson] = useDebouncedValue(json, 800, { leading: false });
  const jsonParseError = React.useMemo(() => {
    if (!debouncedJson) return undefined;
    try {
      JSON.parse(debouncedJson);
    } catch (e: any) {
      if (e.message) {
        return e.message;
      }
      return String(e);
    }
  }, [debouncedJson]);
  return (
    <>
      <JsonInput
        label="Config File (in JSON)"
        placeholder="Put the contents of the config file here."
        formatOnBlur
        onChange={setJson}
        error={jsonParseError}
        rows={14}
      />
      <ImportButton
        disabled={!json || !!jsonParseError}
        getImportPayload={async () => tryParseProjectConfigJson(json)}
      />
    </>
  );
}
