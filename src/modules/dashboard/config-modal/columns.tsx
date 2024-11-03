import {
  NumberField,
  DateTimeField,
  SwitchField,
  TagsField,
  TextField,
} from "@/components/standard/fields/wrapper";
import React from "react";
import { Divider, Group, Stack } from "@mantine/core";
import Colors from "@/common/constants/colors";
import Text from "@/components/standard/text";
import TextLink from "@/components/standard/button/link";

interface ProjectConfigColumnFormProps {
  index: number;
}

export function ProjectConfigColumnCategoricalForm(
  props: ProjectConfigColumnFormProps
) {
  const { index } = props;
  const NAME = `columns.${index}` as const;

  return (
    <Group>
      <NumberField
        name={`${NAME}.minFrequency`}
        label="Min. Frequency"
        decimalScale={0}
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
  const NAME = `columns.${index}` as const;

  return (
    <>
      <NumberField
        name={`${NAME}.bins`}
        label="Bins / Time Slots"
        required
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
      <TextField
        name={`${NAME}.datetimeFormat`}
        label="Datetime Format"
        description={
          <Text size="xs">
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
    <Stack>
      <Text fw="bold">Preprocessing Configuration</Text>
      <Stack>
        <TagsField
          label="Ignore Tokens"
          name={`${PREPROCESSING_NAME}.ignoreTokens`}
          description={
            <Text size="xs">
              The words that should be
              <Text span fw="bold" inherit>
                {` ignored `}
              </Text>
              during the preprocessing step. Use this option to preserve
              important names or words.
            </Text>
          }
        />
        <TagsField
          name={`${PREPROCESSING_NAME}.stopwords`}
          label="Stop Words"
          description={
            <Text size="xs">
              The words that should be
              <Text span fw="bold" inherit>
                {` excluded `}
              </Text>
              from the documents.
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
        <NumberField
          name={`${PREPROCESSING_NAME}.minWordFrequency`}
          label="Min. Word Frequency"
          description="Words with frequencies below this limit will be removed from the documents. This ensures that rare, uninformative words are not included in the topic representation. You may have to lower this value if your dataset is small."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.maxWordFrequency`}
          label="Stop Words"
          percentage
          description="Words with frequencies above this limit will be removed from the documents. This ensures that frequent, generic words (e.g.: go, and, from) are not included in the topic representation."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.maxUniqueWords`}
          label="Max. Unique Words"
          description="The maximum number of unique words that will be kept from the documents. Having too many unique words may take up a lot of memory in your device. Assume that 10M unique words takes up 1GB of RAM. You probably will not need to tune this value if your dataset is not very large."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.minDocumentLength`}
          label="Min. Number of Words in a Document"
          description="Documents with words less than this limit will not be included in the topic modeling procedure as they provide too little information."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.minWordLength`}
          label="Min. Number of Characters in a Word"
          description={`Words with characters less than this limit will be omitted as they do not provide enough information. Consider setting this to 2 if you have acronyms in your dataset, or include any important acronyms in the "Ignore Tokens" field`}
        />
      </Stack>

      <Divider />

      <Text fw="bold">Topic Modeling Configuration</Text>
      <Stack>
        <SwitchField
          name={`${TOPIC_MODELING_NAME}.lowMemory`}
          label="Low Memory"
          description="Turn this mode on if you want to perform other tasks while waiting for the topic modeling procedure to finish."
        />
        <NumberField
          name={`${TOPIC_MODELING_NAME}.minTopicSize`}
          label="Min. Topic Size"
          min={1}
          description="The minimal number of similar documents to be considered a topic."
          required
        />
        <NumberField
          name={`${TOPIC_MODELING_NAME}.maxTopicSize`}
          label="Max. Topic Size"
          max={100}
          percentage
          description="The maximum number of documents that are grouped into the same topic. A low value will make the algorithm discover more specific topics, while a high value encourages the model to find more generic, but potentially imbalanced topics. Note that this field is in percentages."
        />
        <NumberField
          name={`${TOPIC_MODELING_NAME}.maxTopics`}
          label="Max Topics"
          min={1}
          description="The maximum number of topics that can be discovered by the model. If the model discovers more topics than this threshold, then the smaller topics will be merged iteratively into a bigger topic."
        />
        <Stack>
          <Group>
            <NumberField
              name={`${TOPIC_MODELING_NAME}.nGramRangeStart`}
              label="N-Gram Range Start"
              min={1}
              className="flex-1"
            />
            <NumberField
              name={`${TOPIC_MODELING_NAME}.nGramRangeEnd`}
              label="N-Gram Range End"
              min={1}
              className="flex-1"
            />
          </Group>
          <Text size="sm" c={Colors.foregroundDull}>
            N-Gram Range specifies the length of the phrases that can be used as
            the topic representation. For example, n-gram range of length (1, 2)
            will allow phrases like &quot;door&quot; and &quot;door hinge&quot;
            to be included into the the topic representation; but phrases like
            &quot;the door hinge&quot; will be excluded.
          </Text>
        </Stack>
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
      </Stack>
    </Stack>
  );
}
