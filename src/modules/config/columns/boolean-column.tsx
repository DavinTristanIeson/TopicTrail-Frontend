import RHFField from '@/components/standard/fields';
import { Stack } from '@mantine/core';
import { ProjectConfigColumnFormProps } from './utils';

export default function ProjectConfigColumnBooleanForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const PARENT_NAME = `columns.${index}` as const;
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
