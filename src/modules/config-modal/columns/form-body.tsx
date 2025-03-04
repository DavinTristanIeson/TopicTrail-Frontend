import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { ConfigureDataSourceForm, ProjectIdForm } from './phases';
import {
  DefaultProjectSchemaColumnValues,
  ProjectConfigFormType,
} from '../form-type';
import {
  Accordion,
  Button,
  Divider,
  Flex,
  Group,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  ProjectConfigColumnCategoricalForm,
  ProjectConfigColumnContinuousForm,
  ProjectConfigColumnTemporalForm,
  ProjectConfigColumnTextualForm,
} from './columns';
import React from 'react';
import Text from '@/components/standard/text';
import { SelectField, TextField } from '@/components/standard/fields/wrapper';
import { ArrowLeft, FloppyDisk, Warning } from '@phosphor-icons/react';
import SubmitButton from '@/components/standard/button/submit';
import FieldWatcher, {
  FieldErrorWatcher,
} from '@/components/standard/fields/watcher';
import Colors from '@/common/constants/colors';
import { ProjectSchemaTypeIcon } from '@/modules/projects/common/select';

interface ProjectConfigColumnFormItemProps {
  accordionValue: string;
  parentName: `columns.${number}`;
}

function ProjectConfigColumnFormItemSwitcher(
  props: ProjectConfigColumnFormItemProps,
) {
  const { parentName } = props;
  const type = useWatch({
    name: `${parentName}.type`,
  });

  if (type === SchemaColumnTypeEnum.Categorical) {
    return <ProjectConfigColumnCategoricalForm parentName={parentName} />;
  }
  if (type === SchemaColumnTypeEnum.Continuous) {
    return <ProjectConfigColumnContinuousForm parentName={parentName} />;
  }
  if (type === SchemaColumnTypeEnum.Temporal) {
    return <ProjectConfigColumnTemporalForm parentName={parentName} />;
  }
  if (type === SchemaColumnTypeEnum.Textual) {
    return <ProjectConfigColumnTextualForm parentName={parentName} />;
  }
  return undefined;
}

function ProjectConfigColumnFormItem(props: ProjectConfigColumnFormItemProps) {
  const { parentName, accordionValue } = props;
  const { setValue, getValues } = useFormContext<ProjectConfigFormType>();
  return (
    <Accordion.Item value={accordionValue}>
      <Accordion.Control>
        <FieldWatcher names={[`${parentName}.name`, `${parentName}.type`]}>
          {(values) => {
            const name = values[`${parentName}.name`] as string | undefined;
            const type = values[`${parentName}.type`] as
              | SchemaColumnTypeEnum
              | undefined;
            return (
              <Group>
                <FieldErrorWatcher name={parentName}>
                  {(error) =>
                    error && (
                      <Tooltip
                        label={error}
                        radius="sm"
                        color={Colors.sentimentError}
                      >
                        <Warning color={Colors.sentimentError} />
                      </Tooltip>
                    )
                  }
                </FieldErrorWatcher>
                <ProjectSchemaTypeIcon type={type} />
                <Text fw="bold" size="md">
                  {name}
                </Text>
              </Group>
            );
          }}
        </FieldWatcher>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack>
          <Group align="center">
            <TextField
              name={`${parentName}.name`}
              label="Name"
              description="The name of the column. This field is CASE-SENSITIVE! Please make sure that the title of this column does not contain any special characters."
              required
              w="47%"
            />
            <TextField
              name={`${parentName}.datasetName`}
              label="Dataset Name"
              description="The name of the column in the original dataset. This field is CASE-SENSITIVE, which means that 'abc' and 'ABC' are treated as different words!"
              required
              w="47%"
            />
          </Group>
          <SelectField
            name={`${parentName}.type`}
            label="Type"
            description="The type of the column. Please note that providing the wrong column type can cause the application to error."
            required
            allowDeselect={false}
            data={[
              {
                value: SchemaColumnTypeEnum.Categorical,
                label: 'Categorical',
              },
              {
                value: SchemaColumnTypeEnum.Continuous,
                label: 'Continuous',
              },
              {
                value: SchemaColumnTypeEnum.Temporal,
                label: 'Temporal',
              },
              {
                value: SchemaColumnTypeEnum.Textual,
                label: 'Textual',
              },
              {
                value: SchemaColumnTypeEnum.Unique,
                label: 'Unique',
              },
            ]}
            clearable={false}
            onChange={(type) => {
              if (type == null) {
                return;
              }
              setValue(
                parentName,
                DefaultProjectSchemaColumnValues(
                  getValues(`${parentName}.name`),
                  type as SchemaColumnTypeEnum,
                ),
              );
            }}
          />
          <Divider />
          <ProjectConfigColumnFormItemSwitcher {...props} />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
