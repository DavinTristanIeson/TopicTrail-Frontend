import { useFormContext } from "react-hook-form";
import { ProjectConfigFormType } from "./form-type";
import {
  NumberField,
  DateTimeField,
  SwitchField,
  TagsField,
} from "@/components/standard/fields/wrapper";
import React from "react";
import { Group, Switch, TextInput } from "@mantine/core";
import Colors from "@/common/constants/colors";
import Text from "@/components/standard/text";
import TextLink from "@/components/standard/button/link";
import get from "lodash/get";

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
    register,
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
      <TextInput
        {...register(`${NAME}.datetimeFormat`)}
        error={get(errors, `${NAME}.datetimeFormat`)?.message}
        name={`${NAME}.datetimeFormat`}
        label="Datetime Format"
        description={
          <Text>
            The datetime format used for the column. You can find the reference
            for the format in here:
            <TextLink href="https://strftime.org/">
              https://strftime.org/
            </TextLink>
          </Text>
        }
      />
    </>
  );
}

export function ProjectConfigColumnTextualForm(
  props: ProjectConfigColumnFormProps
) {
  const { index } = props;
  const PREPROCESSING_NAME = `columns.${index}.preprocessing` as const;
  const TOPIC_MODELING_NAME = `columns.${index}.topicModeling` as const;

  return (
    <div>
      <Text fw="bold">Preprocessing Configuration</Text>
      <div>
        <TagsField
          label="Ignore Tokens"
          name={`${PREPROCESSING_NAME}.ignoreTokens`}
        />
        <TagsField
          name={`${PREPROCESSING_NAME}.stopwords`}
          label="Stop Words"
          description={
            <Text>
              The words that
              <Text inline fw="bold">
                {` should `}
              </Text>
              be excluded from the documents.
            </Text>
          }
        />
        <SwitchField
          name={`${PREPROCESSING_NAME}.removeEmail`}
          label="Remove email?"
          description="Should all emails be removed from the column? Turn this off if emails are important."
        />
        <SwitchField
          name={`${PREPROCESSING_NAME}.removeUrl`}
          label="Remove URL?"
          description="Should all URLs be removed from the column? Turn this off if URLs are important."
        />
        <SwitchField
          name={`${PREPROCESSING_NAME}.removeNumber`}
          label="Remove number?"
          description="Should all numbers be removed? Turn this off if numbers are important."
        />
      </div>

      <Text fw="bold">Topic Modeling Configuration</Text>
      <div>
        <SwitchField
          name={`${TOPIC_MODELING_NAME}.lowMemory`}
          label="Low Memory"
          description="Turn this mode on if you want to perform other tasks while waiting for the topic modeling procedure to finish."
        />
        <Group justify="space-between">
          <NumberField
            name={`${TOPIC_MODELING_NAME}.minTopicSize`}
            label="Min. Topic Size"
            min={1}
            description="The minimal number of similar documents to be considered a topic."
            w="100%"
          />
          <NumberField
            name={`${TOPIC_MODELING_NAME}.maxTopicSize`}
            label="Max. Topic Size"
            min={1}
            description="The maximum number of documents that are grouped into the same topic. A low value will make the algorithm discover more specific topics, while a high value encourages the model to find more generic, but potentially imbalanced topics."
            w="100%"
          />
        </Group>
        <NumberField
          name={`${TOPIC_MODELING_NAME}.maxTopics`}
          label="Max Topics"
          min={1}
          description="The maximum number of topics that can be discovered by the model. If the model discovers more topics than this threshold, then the smaller topics will be merged iteratively into a bigger topic."
        />
        <div>
          <Group justify="space-between">
            <NumberField
              name={`${TOPIC_MODELING_NAME}.nGramRangeStart`}
              label="N-Gram Range Start"
              min={1}
              w="100%"
            />
            <NumberField
              name={`${TOPIC_MODELING_NAME}.nGramRangeEnd`}
              label="N-Gram Range End"
              min={1}
              w="100%"
            />
          </Group>
          <Text size="sm">
            N-Gram Range specifies the length of the phrases that can be used as
            the topic representation. For example, n-gram range of length (1, 2)
            will allow phrases like &quot;door&quot; and &quot;door hinge&quot;
            to be included into the the topic representation; but phrases like
            &quot;the door hinge&quot; will be excluded.
          </Text>
        </div>
        <Group justify="space-between">
          <SwitchField
            label="No Outliers"
            description="Should the model produce any outliers? If this is set to false, all documents will be assigned to one topic."
            name="noOutliers"
          />
          <SwitchField
            label="Represent Outliers"
            description="Should the outliers be included in the topic representation? This is only enabled if No Outliers is set to true. Note that by enabling this option, you risk polluting the topic representations found by the model with irrelevant words."
            name="representOutliers"
          />
        </Group>
      </div>
    </div>
  );
}
