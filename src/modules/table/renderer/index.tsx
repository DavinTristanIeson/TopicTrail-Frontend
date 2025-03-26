import { SchemaColumnModel } from '@/api/project';
import { TableSortModel } from '@/api/table';
import React from 'react';
import { Table, ScrollArea, Group } from '@mantine/core';
import { TableSortActionIcon } from './use-sort-state';
import { ColumnCellRenderer } from './cell';

interface TableRendererComponentProps {
  columns: SchemaColumnModel[];
  data: Record<string, any>[];
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  const { data, columns, sort, setSort } = props;

  const prevData = React.useRef(data);
  const keyPrefix = React.useRef(Math.random().toString(16));
  if (prevData.current !== data) {
    // Randomize key prefix
    keyPrefix.current = Math.random().toString(16);
  }

  return (
    <ScrollArea>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        style={{
          tableLayout: 'fixed',
          minWidth: columns.length * 200,
          maxWidth: columns.length * 600,
        }}
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th
                key={column.name}
                className="whitespace-nowrap"
                onResize={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                style={{
                  resize: 'horizontal',
                  overflow: 'auto',
                  minWidth: 200,
                  maxWidth: 600,
                }}
              >
                <Group justify="space-between">
                  {column.name}
                  <TableSortActionIcon
                    sort={sort}
                    setSort={setSort}
                    column={column.name}
                  />
                </Group>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, index) => (
            <Table.Tr key={index}>
              {columns.map((column) => (
                <Table.Td key={column.name}>
                  <ColumnCellRenderer
                    column={column}
                    value={row[column.name]}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
