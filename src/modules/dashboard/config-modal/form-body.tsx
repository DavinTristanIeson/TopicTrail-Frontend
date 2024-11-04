import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ConfigureDataSourceForm, ProjectIdForm } from "./phases";
import {
  DefaultProjectSchemaColumnValues,
  ProjectConfigFormType,
} from "./form-type";
import {
  Accordion,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { EnumList, SchemaColumnTypeEnum } from "@/common/constants/enum";
import {
  ProjectConfigColumnCategoricalForm,
  ProjectConfigColumnContinuousForm,
  ProjectConfigColumnTemporalForm,
  ProjectConfigColumnTextualForm,
} from "./columns";
import React from "react";
import Text from "@/components/standard/text";
import { TextField } from "@/components/standard/fields/wrapper";
import { ArrowLeft, FloppyDisk, Warning } from "@phosphor-icons/react";
import SubmitButton from "@/components/standard/button/submit";
import FieldWatcher, {
  FieldErrorWatcher,
} from "@/components/standard/fields/watcher";
import Colors from "@/common/constants/colors";
import { ProjectSchemaTypeIcon } from "@/modules/projects/common/select";

interface ProjectConfigColumnFormItemProps {
  accordionValue: string;
  parentName: `columns.${number}`;
}

function ProjectConfigColumnFormItemSwitcher(
  props: ProjectConfigColumnFormItemProps
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
          <Select
            name={`${parentName}.type`}
            type={EnumList.SchemaColumnTypeEnum}
            label="Type"
            description="The type of the column. Please note that providing the wrong column type can cause the application to error."
            required
            allowDeselect={false}
            data={[
              {
                label: SchemaColumnTypeEnum.Categorical,
                value: "Categorical",
              },
              {
                label: SchemaColumnTypeEnum.Continuous,
                value: "Continuous",
              },
              {
                label: SchemaColumnTypeEnum.Temporal,
                value: "Temporal",
              },
              {
                label: SchemaColumnTypeEnum.Textual,
                value: "Textual",
              },
              {
                label: SchemaColumnTypeEnum.Unique,
                value: "Unique",
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
                  type as SchemaColumnTypeEnum
                )
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

function ProjectConfigColumnsFieldArray() {
  const { control } = useFormContext<ProjectConfigFormType>();
  const { fields } = useFieldArray({
    name: "columns",
    control,
    keyName: "__fieldId",
  });

  return (
    <Accordion>
      {fields.map((field, index) => {
        return (
          <ProjectConfigColumnFormItem
            parentName={`columns.${index}`}
            key={field.__fieldId}
            accordionValue={field.__fieldId}
          />
        );
      })}
    </Accordion>
  );
}

interface ProjectConfigFormBodyProps {
  onBack?(): void;
}

export default function ProjectConfigFormBody(
  props: ProjectConfigFormBodyProps
) {
  return (
    <Stack>
      <Title order={2}>3/3: Project Configuration</Title>
      <ProjectIdForm disabled />

      <Title order={4}>Dataset</Title>
      <ConfigureDataSourceForm disabled />

      <Title order={4}>Schema</Title>
      <ProjectConfigColumnsFieldArray />

      <Flex justify="space-between" direction="row-reverse" align="center">
        <SubmitButton leftSection={<FloppyDisk size={20} />}>
          Save Project
        </SubmitButton>
        <Button
          leftSection={<ArrowLeft size={20} />}
          variant="outline"
          onClick={props.onBack}
        >
          Change Project Name?
        </Button>
      </Flex>
    </Stack>
  );
}
