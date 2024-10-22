import { useFormContext } from "react-hook-form";
import { ProjectConfigFormType } from "./form-type";
import NumberField from "@/components/standard/fields/number-field";
import React from "react";
import { Group, Switch } from "@mantine/core";
import Colors from "@/common/constants/colors";
import Text from "@/components/standard/text";
import { DatePicker } from "@mantine/dates";
import DateTimeField from "@/components/standard/fields/date-field";

interface ProjectConfigColumnFormProps {
  index: number;
}

export function ProjectConfigColumnCategoricalForm(
  props: ProjectConfigColumnFormProps
) {
  const { index } = props;
  const NAME = `columns.${index}` as const;

  const [isPercentage, setIsPercentage] = React.useState(false);

  return (
    <Group>
      <Switch
        checked={isPercentage}
        onChange={(e) => setIsPercentage(e.target.checked)}
      />
      <NumberField
        name={`${NAME}.minFrequency`}
        label="Min. Frequency"
        decimalScale={isPercentage ? 0 : undefined}
        rightSection={
          isPercentage ? <Text c={Colors.foregroundDull}>%</Text> : undefined
        }
        description="The minimum frequency for a value to be considered a category in the column."
      />
    </Group>
  );
}

export function ProjectConfigColumnContinuousForm(
  props: ProjectConfigColumnFormProps
) {
  const { index } = props;
  const NAME = `columns.${index}` as const;

  return (
    <>
      <NumberField
        name={`${NAME}.lowerBound`}
        label="Lower Bound"
        description="The lowest value that can appear in the column; any lower values will be set to this value."
      />
      <NumberField
        name={`${NAME}.upperBound`}
        label="Upper Bound"
        description="The highest value that can appear in the column; any higher values will be set to this value."
      />
    </>
  );
}

export function ProjectConfigColumnTemporalForm(
  props: ProjectConfigColumnFormProps
) {
  const { index } = props;
  const {
    formState: { errors },
  } = useFormContext<ProjectConfigFormType>();
  const NAME = `columns.${index}` as const;

  return (
    <>
      <NumberField
        name={`${NAME}.bins`}
        label="Bins / Time Slots"
        description="This value specifies how many partitions will be created from the range of date values. For example, with bins = 4, values from 1st January 2024 to 31st January 2024 can be partitioned into: Jan 1 to Jan 7, Jan 8 to Jan 15, Jan 16 to Jan 23, and Jan 24 to Jan 31. This will be useful when studying how the topics develop with time."
      />
      <DateTimeField
        name={`${NAME}.minDate`}
        label="Earliest Date"
        description="The earliest value that can appear in the column; any earlier values will be set to this value."
      />
      <DateTimeField
        name={`${NAME}.maxDate`}
        label="Latest Date"
        description="The latest value that can appear in the column; any later values will be set to this value."
      />
    </>
  );
}
