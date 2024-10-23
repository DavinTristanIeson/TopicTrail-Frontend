import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ProjectConfigDataSourceForm, ProjectIdForm } from "./phases";
import { ProjectConfigFormType } from "./form-type";
import { Accordion } from "@mantine/core";
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
        <Controller
          name={`${NAME}.name`}
          render={({ field }) => {
            return (
              <Text fw="bold" size="md">
                {field.value}
              </Text>
            );
          }}
        />
      </Accordion.Control>
      <Accordion.Panel>
        <TextField
          name={`${NAME}.name`}
          label="Name"
          description="The name of the column. This field is CASE-SENSITIVE, which means that 'abc' and 'ABC' are treated as different words!"
        />
        <EnumSelectField
          name={`${NAME}.type`}
          type={EnumList.SchemaColumnTypeEnum}
          label="Type"
          description="The type of the column. Please note that providing the wrong column type can cause the application to error."
        />
        <ProjectConfigColumnFormItemSwitcher {...props} />
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

export default function ProjectConfigFormBody() {
  return (
    <>
      <ProjectIdForm />
      <ProjectConfigDataSourceForm readOnly />
      <ProjectConfigColumnsFieldArray />
    </>
  );
}
