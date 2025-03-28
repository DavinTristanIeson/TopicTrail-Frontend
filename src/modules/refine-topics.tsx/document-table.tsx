import { DocumentPerTopicModel, TopicModel } from '@/api/topic';
import { Tooltip, Text } from '@mantine/core';
import { type MRT_ColumnDef } from 'mantine-react-table';
import React from 'react';
import { TextualColumnCell } from '../table/cell';
import { TopicSelectInput } from '../topics/results/select-topic-input';
import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType } from './form-type';
import { TextualSchemaColumnModel } from '@/api/project';
import { useTableStateSetup } from '../table/context';

interface DocumentTableSelectInputProps {
  topics: TopicModel[];
  row: DocumentPerTopicModel;
}

function DocumentTableSelectInput(props: DocumentTableSelectInputProps) {
  const { topics, row } = props;
  const { control } = useFormContext<RefineTopicsFormType>();
  const documentTopics = useWatch({
    control,
    name: 'document_topics',
  });

  const topicValue = documentTopics[row.id.toString()] ?? row.topic;

  return (
    <TopicSelectInput data={topics} value={topicValue} variant="unstyled" />
  );
}

function useDocumentTableColumns(topics: TopicModel[]) {
  return React.useMemo<MRT_ColumnDef<DocumentPerTopicModel>[]>(() => {
    return [
      {
        accessorKey: 'original',
        size: 400,
        header: 'Original Documents',
        Header: (
          <Tooltip label="These are the original documents in the dataset that hasn't been preprocessed.">
            <Text size="sm" fw={500}>
              Original Documents
            </Text>
          </Tooltip>
        ),
        Cell({ cell: { getValue } }) {
          return (
            <TextualColumnCell>
              {getValue() as React.ReactNode}
            </TextualColumnCell>
          );
        },
      },
      {
        accessorKey: 'preprocessed',
        header: 'Preprocessed Documents',
        size: 400,
        Header: (
          <Tooltip label="These are the documents that have been preprocessed as part of the topic modeling algorithm.">
            <Text size="sm" fw={500}>
              Preprocessed Documents
            </Text>
          </Tooltip>
        ),
        Cell({ cell: { getValue } }) {
          return (
            <TextualColumnCell>
              {getValue() as React.ReactNode}
            </TextualColumnCell>
          );
        },
      },
      {
        accessorKey: 'topic',
        header: 'Topic',
        size: 400,
        Cell({ row: { original } }) {
          return <DocumentTableSelectInput topics={topics} row={original} />;
        },
      },
    ];
  }, [topics]);
}

interface RefineTopicsDocumentTableProps {
  column: TextualSchemaColumnModel;
  topic: TopicModel;
  topics: TopicModel[];
}

export function RefineTopicsDocumentTable(
  props: RefineTopicsDocumentTableProps,
) {
  const { column, topic, topics } = props;
  const columns = useDocumentTableColumns(topics);

  const tableState = useTableStateSetup();
  return <></>;
}
