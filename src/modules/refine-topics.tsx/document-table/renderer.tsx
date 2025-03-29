import { TopicModel, DocumentPerTopicModel } from '@/api/topic';
import { TextualColumnCell } from '@/modules/table/cell';
import { TopicSelectInput } from '@/modules/topics/results/select-topic-input';
import { Tooltip, Text } from '@mantine/core';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { useFormContext, useWatch } from 'react-hook-form';
import { RefineTopicsFormType } from '../form-type';
import React from 'react';
import {
  MantineReactTableBehaviors,
  useTableStateToMantineReactTableAdapter,
} from '@/modules/table/adapter';
import { PaginationMetaModel } from '@/api/table';

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

interface RefineTopicsDocumentTableRendererProps {
  data: DocumentPerTopicModel[];
  meta: PaginationMetaModel | undefined;
  topics: TopicModel[];
  isFetching: boolean;
}

export function RefineTopicsDocumentTableRenderer(
  props: RefineTopicsDocumentTableRendererProps,
) {
  const { topics, data, meta, isFetching } = props;
  const columns = useDocumentTableColumns(topics);
  const tableStateBehaviors = useTableStateToMantineReactTableAdapter({
    isFetching,
    meta,
  });

  const table = useMantineReactTable<DocumentPerTopicModel>({
    data,
    columns,
    ...tableStateBehaviors,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.Virtualized(data, columns),
  });
  return <MantineReactTable table={table} />;
}
