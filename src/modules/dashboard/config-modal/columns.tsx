import {
  NumberField,
  DateTimeField,
  SwitchField,
  TagsField,
  TextField,
} from "@/components/standard/fields/wrapper";
import React from "react";
import { Divider, Group, Select, Stack } from "@mantine/core";
import Colors from "@/common/constants/colors";
import Text from "@/components/standard/text";
import TextLink from "@/components/standard/button/link";
import {
  DocumentEmbeddingMethodEnum,
  FillNaModeEnum,
  SchemaColumnTypeEnum,
} from "@/common/constants/enum";
import { useController } from "react-hook-form";

interface ProjectConfigColumnFormProps {
  parentName: string;
}

function ProjectConfigFillNaOption(
  props: ProjectConfigColumnFormProps & {
    type: SchemaColumnTypeEnum;
  }
) {
  const { parentName, type } = props;
  const { field } = useController({
    name: `${parentName}.fillNa`,
  });
  const labels: Record<FillNaModeEnum, string> = {
    [FillNaModeEnum.Exclude]:
      "All missing values will be left as-is. They will be excluded when finding the association between the topics and other variables.",
    [FillNaModeEnum.ForwardFill]:
      "The latest valid value will be used to replace the missing values. For example: 12, 13, N/A, N/A, 14 will become 12, 13, 13, 13, 14 as the latest valid value is 13. USE THIS WITH CAUTION: Only use this if the behavior makes sense, otherwise use Exclude or Fill Value.",
    [FillNaModeEnum.BackwardFill]:
      "The next valid value will be used to replace the missing values. For example: 12, 13, N/A, N/A, 14 will become 12, 13, 14, 14, 14 as the next valid value is 14. USE THIS WITH CAUTION: Only use this if the behavior makes sense, otherwise use Exclude or Fill Value.",
    [FillNaModeEnum.Value]:
      "The user-specified value will be used to replace the missing values.",
  };

  const sharedFillValueFieldProps = {
    name: `${parentName}.fillNaValue`,
    label: "Fill Value",
    description: "Value used to substitute missing values.",
    required: true,
  };

  return (
    <Group>
      <Select
        value={field.value}
        onChange={field.onChange}
        allowDeselect={false}
        clearable={false}
        label="Fill N/A Mode"
        description={`Defines how missing values should be handled. ${
          labels[field.value as FillNaModeEnum] ?? ""
        }`}
        required
        data={[
          {
            label: "Exclude",
            value: FillNaModeEnum.Exclude,
          },
          {
            label: "Fill Forward",
            value: FillNaModeEnum.ForwardFill,
          },
          {
            label: "Fill Backward",
            value: FillNaModeEnum.BackwardFill,
          },
          {
            label: "Fill Value",
            value: FillNaModeEnum.Value,
          },
        ]}
      />
      {field.value === FillNaModeEnum.Value &&
        (type === SchemaColumnTypeEnum.Continuous ? (
          <NumberField {...sharedFillValueFieldProps} />
        ) : type === SchemaColumnTypeEnum.Temporal ? (
          <DateTimeField {...sharedFillValueFieldProps} />
        ) : (
          <TextField {...sharedFillValueFieldProps} />
        ))}
    </Group>
  );
}

export function ProjectConfigColumnCategoricalForm(
  props: ProjectConfigColumnFormProps
) {
  const { parentName } = props;

  return (
    <Group>
      <NumberField
        name={`${parentName}.minFrequency`}
        label="Min. Frequency"
        decimalScale={0}
        description="The minimum frequency for a value to be considered a category in the column."
      />
      <ProjectConfigFillNaOption
        parentName={parentName}
        type={SchemaColumnTypeEnum.Categorical}
      />
    </Group>
  );
}

export function ProjectConfigColumnContinuousForm(
  props: ProjectConfigColumnFormProps
) {
  const { parentName } = props;

  return (
    <>
      <NumberField
        name={`${parentName}.lowerBound`}
        label="Lower Bound"
        description="The lowest value that can appear in the column; any lower values will be set to this value."
      />
      <NumberField
        name={`${parentName}.upperBound`}
        label="Upper Bound"
        description="The highest value that can appear in the column; any higher values will be set to this value."
      />
      <ProjectConfigFillNaOption
        parentName={parentName}
        type={SchemaColumnTypeEnum.Continuous}
      />
    </>
  );
}

export function ProjectConfigColumnTemporalForm(
  props: ProjectConfigColumnFormProps
) {
  const { parentName } = props;

  return (
    <>
      <NumberField
        name={`${parentName}.bins`}
        label="Bins / Time Slots"
        required
        description="This value specifies how many partitions will be created from the range of date values. For example, with bins = 4, values from 1st January 2024 to 31st January 2024 can be partitioned into: Jan 1 to Jan 7, Jan 8 to Jan 15, Jan 16 to Jan 23, and Jan 24 to Jan 31. This will be useful when studying how the topics develop with time."
      />
      <DateTimeField
        name={`${parentName}.minDate`}
        label="Earliest Date"
        description="The earliest value that can appear in the column; any earlier values will be set to this value."
      />
      <DateTimeField
        name={`${parentName}.maxDate`}
        label="Latest Date"
        description="The latest value that can appear in the column; any later values will be set to this value."
      />
      <TextField
        name={`${parentName}.datetimeFormat`}
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
      <ProjectConfigFillNaOption
        parentName={parentName}
        type={SchemaColumnTypeEnum.Temporal}
      />
    </>
  );
}

function EmbeddingMethodSelectField(props: ProjectConfigColumnFormProps) {
  const { field } = useController({
    name: `${props.parentName}.topicModeling.embeddingMethod`,
  });

  const labels: Record<DocumentEmbeddingMethodEnum, string> = {
    [DocumentEmbeddingMethodEnum.Doc2Vec]:
      "Doc2Vec embeddings are fast compared to SBERT, but they need a lot of documents (preferably >5,000) to work well. Use this if you have many short documents.",
    [DocumentEmbeddingMethodEnum.SBERT]:
      "SBERT embeddings are more semantically accurate than Doc2Vec, but they take a long time to process on devices without GPUs. Use this if you only have a few short documents.",
    [DocumentEmbeddingMethodEnum.TFIDF]:
      "TF-IDF embeddings do not capture the semantic relationship between words so they may perform worse on short documents. Use this if your documents are long.",
  };
  return (
    <Select
      value={field.value}
      onChange={field.onChange}
      data={[
        {
          label: "Doc2Vec",
          value: DocumentEmbeddingMethodEnum.Doc2Vec,
        },
        {
          label: "SBERT",
          value: DocumentEmbeddingMethodEnum.SBERT,
        },
        {
          label: "TF-IDF Vectorization",
          value: DocumentEmbeddingMethodEnum.TFIDF,
        },
      ]}
      allowDeselect={false}
      clearable={false}
      required
      label="Document Embedding Method"
      description={`The method that is used to convert the documents into a numerical representation that the algorithm can understand. ${
        labels[field.value as DocumentEmbeddingMethodEnum.Doc2Vec] ?? ""
      }`}
    />
  );
}

export function ProjectConfigColumnTextualForm(
  props: ProjectConfigColumnFormProps
) {
  const { parentName } = props;
  const PREPROCESSING_NAME = `${parentName}.preprocessing` as const;
  const TOPIC_MODELING_NAME = `${parentName}.topicModeling` as const;

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
          description="Words with frequencies below this threshold will be removed from the documents. This ensures that rare, uninformative words are not included in the topic representation. You may have to lower this value if your dataset is small."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.maxWordFrequency`}
          label="Max. Word Frequency"
          percentage
          description="Words with frequencies above this threshold will be removed from the documents. This ensures that frequent, generic words (e.g.: go, and, from) are not included in the topic representation."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.maxUniqueWords`}
          label="Max. Unique Words"
          description="The maximum number of unique words that will be kept from the documents. Having too many unique words may take up a lot of memory in your device. Assume that 10M unique words takes up 1GB of RAM. You probably will not need to tune this value if your dataset is not very large."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.minDocumentLength`}
          label="Min. Number of Words in a Document"
          description="Documents with words less than this threshold will not be included in the topic modeling procedure as they provide too little information."
        />
        <NumberField
          name={`${PREPROCESSING_NAME}.minWordLength`}
          label="Min. Number of Characters in a Word"
          description={`Words with characters less than this threshold will be omitted as they do not provide enough information. Consider setting this to 2 if you have acronyms in your dataset, or include any important acronyms in the "Ignore Tokens" field`}
        />
      </Stack>

      <Divider />

      <Text fw="bold">Topic Modeling Configuration</Text>
      <Stack>
        <EmbeddingMethodSelectField {...props} />
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
            description={`Should the model produce any outliers? If this is set to false, all documents will be assigned to one topic. Note that this option alone only affects the document-topic assignments. It doesn't affect the topic representations (and frequencies) if you don't enable "Represent Outliers".`}
            name={`${TOPIC_MODELING_NAME}.noOutliers`}
          />
          <SwitchField
            label="Represent Outliers"
            description="Should the outliers be included in the topic representation? This is only enabled if No Outliers is set to true. Note that by enabling this option, you risk polluting the topic representations found by the model with irrelevant words."
            name={`${TOPIC_MODELING_NAME}.representOutliers`}
          />
        </Group>
      </Stack>
    </Stack>
  );
}
