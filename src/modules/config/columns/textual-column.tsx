import { DocumentEmbeddingMethodEnum } from '@/common/constants/enum';
import { Text, Select, Stack, Divider, Group } from '@mantine/core';
import { useController } from 'react-hook-form';
import RHFField from '@/components/standard/fields';
import { ProjectConfigColumnFormProps } from './utils';
import React from 'react';

function EmbeddingMethodSelectField(props: ProjectConfigColumnFormProps) {
  const { field } = useController({
    name: `columns.${props.index}.topic_modeling.embedding_method`,
  });

  const labels: Record<DocumentEmbeddingMethodEnum, string> = {
    [DocumentEmbeddingMethodEnum.Doc2Vec]:
      'Doc2Vec embeddings are fast compared to SBERT, but they need a lot of documents (preferably >5,000) to work well. Use this if you have many short documents.',
    [DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2]:
      'SBERT embeddings are more semantically accurate than Doc2Vec, but they take a long time to process on devices without GPUs. Use this if you only have a few short documents.',
    [DocumentEmbeddingMethodEnum.LSA]:
      'LSA embeddings do not capture the semantic relationship between words so they may perform worse on short documents. Use this if your documents are long.',
  };
  return (
    <Select
      value={field.value}
      onChange={field.onChange}
      // Disabled for now. We don't allow users to change method.
      disabled
      data={[
        {
          label: 'Doc2Vec',
          value: DocumentEmbeddingMethodEnum.Doc2Vec,
        },
        {
          label: 'SBERT: All-MiniLM-L6-v2',
          value: DocumentEmbeddingMethodEnum.All_MiniLM_L6_V2,
        },
        {
          label: 'LSA',
          value: DocumentEmbeddingMethodEnum.LSA,
        },
      ]}
      allowDeselect={false}
      clearable={false}
      required
      label="Document Embedding Method"
      description={`The method that is used to convert the documents into a numerical representation that the algorithm can understand. ${
        labels[field.value as DocumentEmbeddingMethodEnum] ?? ''
      }`}
    />
  );
}

function PreprocessingConfigurationFormBody(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const PREPROCESSING_NAME = `columns.${index}.preprocessing` as const;
  return (
    <>
      <Text fw="bold">Preprocessing Configuration</Text>
      <Stack>
        <RHFField
          type="tags"
          label="Ignore Tokens"
          name={`${PREPROCESSING_NAME}.ignore_tokens`}
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
        <RHFField
          type="tags"
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
        <RHFField
          name={`${PREPROCESSING_NAME}.remove_email`}
          label="Remove email?"
          type="switch"
          description="Should all emails be removed from the column? Turn this off if emails are important."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.remove_url`}
          label="Remove URL?"
          type="switch"
          description="Should all URLs be removed from the column? Turn this off if URLs are important."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.remove_number`}
          label="Remove number?"
          type="switch"
          description="Should all numbers be removed? Turn this off if numbers are important."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.min_df`}
          label="Min. Document Frequency for Words"
          type="number"
          min={1}
          description="Words with frequencies below this threshold will be removed from the documents. This ensures that rare, uninformative words are not included in the topic representation. You may have to lower this value if your dataset is small."
        />
        <RHFField
          type="percentage"
          name={`${PREPROCESSING_NAME}.max_df`}
          label="Max. Document Frequency for Words"
          bounded
          description="Words with frequencies above this threshold will be removed from the documents. This ensures that frequent, generic words (e.g.: go, and, from) are not included in the topic representation."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.max_unique_words`}
          label="Max. Unique Words"
          type="number"
          description="The maximum number of unique words that will be kept from the documents. Having too many unique words may take up a lot of memory in your device. Assume that 10M unique words takes up 1GB of RAM. You probably will not need to tune this value if your dataset is not very large."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.min_document_length`}
          label="Min. Number of Words in a Document"
          type="number"
          description="Documents with words less than this threshold will not be included in the topic modeling procedure as they provide too little information."
        />
        <RHFField
          name={`${PREPROCESSING_NAME}.min_word_length`}
          label="Min. Number of Characters in a Word"
          type="number"
          description={`Words with characters less than this threshold will be omitted as they do not provide enough information. Consider setting this to 2 if you have acronyms in your dataset, or include any important acronyms in the "Ignore Tokens" field`}
        />
      </Stack>
    </>
  );
}

function TopicModelingConfigurationFormBody(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const TOPIC_MODELING_NAME = `columns.${index}.topic_modeling` as const;
  return (
    <>
      <Text fw="bold">Topic Modeling Configuration</Text>
      <Stack>
        <EmbeddingMethodSelectField {...props} />
        <RHFField
          type="number"
          name={`${TOPIC_MODELING_NAME}.min_topic_size`}
          label="Min. Topic Size"
          min={2}
          description="The minimal number of similar documents to be considered a topic."
          required
        />
        <RHFField
          type="percentage"
          name={`${TOPIC_MODELING_NAME}.max_topic_size`}
          label="Max. Topic Size"
          bounded
          description="The maximum number of documents that are grouped into the same topic. A low value will make the algorithm discover more specific topics, while a high value encourages the model to find more generic, but potentially imbalanced topics. Note that this field is in percentages."
        />
        <RHFField
          type="number"
          name={`${TOPIC_MODELING_NAME}.max_topics`}
          label="Max Topics"
          min={1}
          description="The maximum number of topics that can be discovered by the model. If the model discovers more topics than this threshold, then the smaller topics will be merged iteratively into a bigger topic."
        />
        <RHFField
          type="number"
          name={`${TOPIC_MODELING_NAME}.topic_confidence_threshold`}
          label="Topic Confidence Threshold"
          className="flex-1"
          min={2}
          description="How many documents with similar meanings are required before we can be sure that the documents are part of the same topic? This may sound similar to Min. Topic Size; but this hyperparameter controls the minimal amount of similar documents to detect, while Min. Topic Size controls the minimal amount of documents for them to be officially recognized as a topic."
        />
        <RHFField
          type="number"
          name={`${TOPIC_MODELING_NAME}.reference_document_count`}
          label="Reference Document Count"
          className="flex-1"
          classNames={{
            description: 'whitespace-pre-line',
          }}
          min={2}
          description={
            'The number of documents that are considered at once when finding topics. A higher number of documents results in more generic topics, while a smaller number of documents results in more specific topics. Keep in mind that this number should not be too far apart from Min. Topic Size for optimal results.\nBy default, this value is set to Min. Topic Size.'
          }
        />
        <RHFField
          type="number"
          name={`${TOPIC_MODELING_NAME}.top_n_words`}
          label="Number of Topic Words"
          className="flex-1"
          min={3}
          description="The number of words that will be used to describe a topic. A higher number provides more context about the topic, but since some words might not be related to the topic, a high number of topic words may cause confusion rather than clarity."
        />
        <Group justify="space-between" wrap="wrap">
          <RHFField
            type="switch"
            label="No Outliers"
            description={`Should the model produce any outliers? If this is set to false, all documents will be assigned to one topic. Note that this option alone only affects the document-topic assignments. It doesn't affect the topic representations (and frequencies) if you don't enable "Represent Outliers".`}
            name={`${TOPIC_MODELING_NAME}.no_outliers`}
          />
        </Group>
      </Stack>
    </>
  );
}

export function ProjectConfigColumnTextualForm(
  props: ProjectConfigColumnFormProps,
) {
  return (
    <Stack>
      <PreprocessingConfigurationFormBody {...props} />
      <Divider />
      <TopicModelingConfigurationFormBody {...props} />
    </Stack>
  );
}
