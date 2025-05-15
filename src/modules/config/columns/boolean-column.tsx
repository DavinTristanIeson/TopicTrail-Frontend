import RHFField from '@/components/standard/fields';
import { Stack } from '@mantine/core';
import { ProjectConfigColumnFormProps } from './utils';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';

function ProjectConfigColumnBooleanFormManualLabels(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const PARENT_NAME = `columns.${index}` as const;
  const { control } = useFormContext<ProjectConfigFormType>();
  const inferBoolean = useWatch({
    control,
    name: `${PARENT_NAME}.infer_boolean`,
  });
  if (inferBoolean) return null;
  return (
    <Stack>
      <RHFField
        type="text"
        name={`${PARENT_NAME}.positive_label`}
        label="Positive Label"
        description="The label that represents the positive value in the original dataset."
        required
      />
      <RHFField
        type="text"
        name={`${PARENT_NAME}.negative_label`}
        label="Negative Label"
        description="The label that represents the negative value in the original dataset."
        required
      />
    </Stack>
  );
}

export default function ProjectConfigColumnBooleanForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const PARENT_NAME = `columns.${index}` as const;
  return (
    <>
      <RHFField
        type="switch"
        name={`${PARENT_NAME}.infer_boolean`}
        label="Automatically infer boolean values"
        description="Should the boolean values be automatically inferred from the dataset? You should turn off this setting if you don't use default values of 0/1/True/False as your boolean indicators."
      />
      <ProjectConfigColumnBooleanFormManualLabels {...props} />
    </>
  );
}
