import { TopicModel, DocumentPerTopicModel } from '@/api/topic';
import { TextualColumnCell, TopicColumnCell } from '@/modules/table/cell';
import { Tooltip, Text, Stack } from '@mantine/core';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import React from 'react';
import {
  MantineReactTableBehaviors,
  useTableStateToMantineReactTableAdapter,
} from '@/modules/table/adapter';
import { PaginationMetaModel } from '@/api/table';
import { TextualSchemaColumnModel } from '@/api/project';
import RefineTopicsSetTopicsEnMasse, {
  RefineTopicsSelectTopicField,
} from './input';

function useDocumentTableColumns(
  topics: TopicModel[],
  column: TextualSchemaColumnModel,
) {
  return React.useMemo<MRT_ColumnDef<DocumentPerTopicModel>[]>(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
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
        Cell({ row: { original } }) {
          return <TextualColumnCell>{original.original}</TextualColumnCell>;
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
        Cell({ row: { original } }) {
          return <TextualColumnCell>{original.preprocessed}</TextualColumnCell>;
        },
      },
      {
        accessorKey: 'topic',
        header: 'Original Topic',
        size: 250,
        Cell({ row: { original } }) {
          return (
            <TopicColumnCell column={column.name} topic={original.topic} />
          );
        },
      },
      {
        id: 'new_topic',
        header: 'New Topic',
        size: 400,
        Cell({ row: { original } }) {
          return (
            <RefineTopicsSelectTopicField
              name={`document_topics.${original.id}`}
              variant="unstyled"
              className="w-full"
            />
          );
        },
      },
    ];
  }, [column.name]);
}

interface RefineTopicsDocumentTableRendererProps {
  data: DocumentPerTopicModel[];
  meta: PaginationMetaModel | undefined;
  topics: TopicModel[];
  column: TextualSchemaColumnModel;
  isFetching: boolean;
}

export function RefineTopicsDocumentTableRenderer(
  props: RefineTopicsDocumentTableRendererProps,
) {
  const { column, topics, data, meta, isFetching } = props;
  const columns = useDocumentTableColumns(topics, column);
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
  return (
    <Stack>
      <RefineTopicsSetTopicsEnMasse />
      <MantineReactTable table={table} />
    </Stack>
  );
}
