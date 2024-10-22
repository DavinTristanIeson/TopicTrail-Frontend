import { useFieldArray, useFormContext } from "react-hook-form";
import { ProjectConfigDataSourceForm, ProjectIdForm } from "./phases";
import { ProjectConfigFormType } from "./form-type";
import { Accordion, NumberInput } from "@mantine/core";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import get from "lodash/get";
import NumberField from "@/components/standard/fields/number-field";

interface ProjectConfigColumnFormProps {
  type: SchemaColumnTypeEnum;
  index: number;
}

function ProjectConfigColumnForm(props: ProjectConfigColumnFormProps) {
  const { type, index } = props;
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ProjectConfigFormType>();
  const NAME = `columns.${index}` as const;

  if (type === SchemaColumnTypeEnum.Categorical) {
    const FIELD_NAME = `${NAME}.minFrequency` as const;
    return (
      <>
        <NumberField
          name={FIELD_NAME}
          label="Min. Frequency"
          description="The minimum frequency for a value to be considered a category in the column."
        />
      </>
    );
  }
  if (type === SchemaColumnTypeEnum.Continuous) {
    return (
      <>
        <NumberInput
          {...(register(FIELD_NAME) as any)}
          error={get(errors, FIELD_NAME)?.message}
          onChange={(value) =>
            setValue(FIELD_NAME, typeof value === "string" ? 1 : value)
          }
        />
      </>
    );
  }
  return <></>;
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
      {fields.map((field) => (
        <Accordion.Item key={field.__fieldId} value={field.name}>
          <Accordion.Control>{field.name}</Accordion.Control>
          <Accordion.Panel></Accordion.Panel>
        </Accordion.Item>
      ))}
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
