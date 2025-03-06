import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { Accordion, Divider, Group, Stack, Tooltip } from '@mantine/core';
import React from 'react';
import Text from '@/components/standard/text';
import { Warning } from '@phosphor-icons/react';
import { useWatchFieldError } from '@/components/standard/fields/watcher';
import Colors from '@/common/constants/colors';
import { RHFMantineAdapter } from '@/components/standard/fields/adapter';
import { ProjectColumnTypeSelectInput } from '@/modules/project/select-column-input';
import RHFField from '@/components/standard/fields';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';
import { CanChangeColumnTypesContext } from './utils';

interface ProjectConfigColumnFormItemProps {
  index: number;
  accordionValue: string;
}

function ProjectConfigColumnTitle(props: ProjectConfigColumnFormItemProps) {
  const { index } = props;
  const { control } = useFormContext<ProjectConfigFormType>();

  const parentName = `columns.${index}` as const;
  const [name, type] = useWatch({
    name: [`${parentName}.name`, `${parentName}.type`],
    control,
  });
  const error = useWatchFieldError(parentName);
  return (
    <Group>
      {error && (
        <Tooltip label={error} radius="sm" color={Colors.sentimentError}>
          <Warning color={Colors.sentimentError} />
        </Tooltip>
      )}
      <ProjectSchemaTypeIcon type={type} />
      <Text fw="bold" size="md">
        {name}
      </Text>
    </Group>
  );
}

export function ProjectConfigColumnFormItem(
  props: ProjectConfigColumnFormItemProps,
) {
  const { index, accordionValue } = props;
  const parentName = `columns.${index}`;
  const canChangeType = React.useContext(CanChangeColumnTypesContext);
  return (
    <Accordion.Item value={accordionValue}>
      <Accordion.Control>
        <ProjectConfigColumnTitle {...props} />
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Group align="center">
            <RHFMantineAdapter
              props={{
                name: `${parentName}.type`,
                className: 'flex-1',
                disabled: !canChangeType,
              }}
              config={{}}
            >
              {ProjectColumnTypeSelectInput}
            </RHFMantineAdapter>
            <RHFField
              name={`${parentName}.alias`}
              label="Alias"
              type="text"
              description="The alias of the column that will be displayed in tables/graphs. Leave it blank if you don't want any aliases."
              required
              className="flex-1"
            />
          </Group>
          <Divider />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
