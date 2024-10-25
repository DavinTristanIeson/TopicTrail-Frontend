import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProjectConfigDataSourceForm, ProjectIdForm } from "./phases";
import { ProjectConfigFormType } from "./form-type";
import {
  Accordion,
  Button,
  Divider,
  Flex,
  Group,
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
import { EnumSelectField } from "@/components/widgets/enum-select";
import React from "react";
import Text from "@/components/standard/text";
import { TextField } from "@/components/standard/fields/wrapper";
import {
  ArrowLeft,
  ChartBar,
  Clock,
  FloppyDisk,
  GridFour,
  Question,
  TextAUnderline,
  Warning,
} from "@phosphor-icons/react";
import SubmitButton from "@/components/standard/button/submit";
import FieldWatcher, {
  FieldErrorWatcher,
} from "@/components/standard/fields/watcher";
import Colors from "@/common/constants/colors";

interface ProjectConfigColumnFormItemProps {
  accordionValue: string;
  index: number;
}

function ProjectConfigColumnFormItemSwitcher(
  props: ProjectConfigColumnFormItemProps
) {
  const { index } = props;
  const { control } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: `columns.${index}.type`,
    control,
  });

  if (type === SchemaColumnTypeEnum.Categorical) {
    return <ProjectConfigColumnCategoricalForm index={index} />;
  }
  if (type === SchemaColumnTypeEnum.Continuous) {
    return <ProjectConfigColumnContinuousForm index={index} />;
  }
  if (type === SchemaColumnTypeEnum.Temporal) {
    return <ProjectConfigColumnTemporalForm index={index} />;
  }
  if (type === SchemaColumnTypeEnum.Textual) {
    return <ProjectConfigColumnTextualForm index={index} />;
  }
  return undefined;
}

function ProjectConfigColumnFormItem(props: ProjectConfigColumnFormItemProps) {
  const { index, accordionValue } = props;
  const NAME = `columns.${index}` as const;
  return (
    <Accordion.Item value={accordionValue}>
      <Accordion.Control>
        <FieldWatcher names={[`${NAME}.name`, `${NAME}.type`]}>
          {(values) => {
            const name = values[`${NAME}.name`] as string | undefined;
            const type = values[`${NAME}.type`] as
              | SchemaColumnTypeEnum
              | undefined;
            return (
              <Group>
                <FieldErrorWatcher name={NAME}>
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
                {type === SchemaColumnTypeEnum.Categorical ? (
                  <GridFour />
                ) : type === SchemaColumnTypeEnum.Continuous ? (
                  <ChartBar />
                ) : type === SchemaColumnTypeEnum.Temporal ? (
                  <Clock />
                ) : type === SchemaColumnTypeEnum.Textual ? (
                  <TextAUnderline />
                ) : (
                  <Question />
                )}
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
          <TextField
            name={`${NAME}.name`}
            label="Name"
            description="The name of the column. This field is CASE-SENSITIVE, which means that 'abc' and 'ABC' are treated as different words!"
            required
          />
          <EnumSelectField
            name={`${NAME}.type`}
            type={EnumList.SchemaColumnTypeEnum}
            label="Type"
            description="The type of the column. Please note that providing the wrong column type can cause the application to error."
            required
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
            index={index}
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
      <ProjectIdForm />

      <Title order={4}>Dataset</Title>
      <ProjectConfigDataSourceForm disabled />

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
