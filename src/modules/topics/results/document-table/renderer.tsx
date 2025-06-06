import { TextualSchemaColumnModel } from '@/api/project';
import { PaginationMetaModel } from '@/api/table';
import { DocumentPerTopicModel, TopicModel } from '@/api/topic';
import {
  getPlotColor,
  getTextColorBasedOnContrast,
} from '@/common/utils/colors';
import {
  useTableStateToMantineReactTableAdapter,
  MantineReactTableBehaviors,
} from '@/modules/table/adapter';
import { TextualColumnCell, TopicColumnCell } from '@/modules/table/cell';
import {
  type MRT_ColumnDef,
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import React, { useMemo } from 'react';
import { Highlight } from '@mantine/core';

interface DocumentsPerTopicTableRendererProps {
  data: DocumentPerTopicModel[];
  meta: PaginationMetaModel;
  isFetching: boolean;
  column: TextualSchemaColumnModel;
  topics: TopicModel[];
}

function useDocumentsPerTopicTableColumns(
  props: DocumentsPerTopicTableRendererProps,
) {
  const { column, topics } = props;
  const tableColumns = useMemo<MRT_ColumnDef<DocumentPerTopicModel>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'original',
        header: 'Original Text',
        size: 400,
        Cell({ row: { original } }) {
          return (
            <TextualColumnCell spaceEfficient={false}>
              {original.original}
            </TextualColumnCell>
          );
        },
      },
      {
        accessorKey: 'preprocessed',
        header: 'Preprocessed Text',
        size: 400,
        Cell({ row: { original } }) {
          const thisTopic = original.topic;
          const relevantTopicIdx = topics.findIndex(
            (topic) => topic.id === thisTopic,
          );
          const relevantTopic = topics[relevantTopicIdx]!;
          if (relevantTopicIdx === -1 || !relevantTopic) {
            return (
              <TextualColumnCell spaceEfficient={false}>
                {original.preprocessed}
              </TextualColumnCell>
            );
          }
          const highlightedWords = relevantTopic.words.map((word) => word[0]);
          const backgroundColor =
            thisTopic != null ? getPlotColor(thisTopic) : undefined;
          const textColor =
            backgroundColor != null
              ? getTextColorBasedOnContrast(backgroundColor)
              : undefined;
          return (
            <TextualColumnCell spaceEfficient={false}>
              {/* @ts-expect-error This is a valid string, but JSX complains about original.preprocessed not being one */}
              <Highlight
                highlight={highlightedWords ?? []}
                highlightStyles={{
                  backgroundColor,
                  color: textColor,
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {original.preprocessed}
              </Highlight>
            </TextualColumnCell>
          );
        },
      },
      {
        accessorKey: 'topic',
        header: 'Topic',
        size: 250,
        Cell({ row: { original } }) {
          return (
            <TopicColumnCell column={column.name} topic={original.topic} />
          );
        },
      },
    ],
    [column.name, topics],
  );
  return tableColumns;
}

export function DocumentsPerTopicTableRenderer(
  props: DocumentsPerTopicTableRendererProps,
) {
  const { data, meta, isFetching } = props;
  const tableColumns = useDocumentsPerTopicTableColumns(props);

  const tableProps = useTableStateToMantineReactTableAdapter({
    meta,
    isFetching,
  });

  const table = useMantineReactTable<DocumentPerTopicModel>({
    data,
    columns: tableColumns,
    ...tableProps,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    ...MantineReactTableBehaviors.Virtualized(data, tableColumns),
  });

  return <MantineReactTable table={table} />;
}
