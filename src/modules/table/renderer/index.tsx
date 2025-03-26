import { SchemaColumnModel } from '@/api/project';
import { TableSortModel } from '@/api/table';
import React, { useState } from 'react';
import { Text, Table, ScrollArea, Spoiler } from '@mantine/core';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface TableRendererComponentProps {
  columns: SchemaColumnModel[];
  data: Record<string, any>[];
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
}

export default function TableRendererComponent(
  props: TableRendererComponentProps,
) {
  const { data, sort, setSort } = props;

  const table_columns = [
    'Title',
    'PositiveReview',
    'NegativeReview',
    'Score',
    'GuestName',
    'GuestCountry',
    'RoomType',
    'NumberOfNights',
    'VisitDate',
    'GroupType',
  ];

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    table_columns.reduce((acc, col) => ({ ...acc, [col]: 150 }), {})
  );

  const handleResize = (col: string, event: any, { size }: any) => {
    setColumnWidths((prevWidths) => ({
      ...prevWidths,
      [col]: Math.max(50, Math.min(size.width, 600))
    }));
  };

  const handleSort = (name: string) => {
    setSort((prevSort) => {
      if (prevSort?.name === name) {
        return prevSort.asc ? { name, asc: false } : null;
      }
      return { name, asc: true };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const valueA = a[sort.name] ?? '';
      const valueB = b[sort.name] ?? '';

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.asc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      if (valueA < valueB) return sort.asc ? -1 : 1;
      if (valueA > valueB) return sort.asc ? 1 : -1;
      return 0;
    });
  }, [data, sort]);

  const SortIcon = ({ asc }: { asc: boolean }) => (
    <span style={{ marginLeft: 5 }}>
      {asc ? '▲' : '▼'}
    </span>
  );

  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <thead>
          <tr>
            {table_columns.map((col) => (
              <Resizable
                key={col}
                width={columnWidths[col] ?? 150}
                height={40}
                onResize={(e, data) => handleResize(col, e, data)}
              >
                <th
                  className="border border-gray-400 px-4 py-2 cursor-pointer"
                  onClick={() => handleSort(col)}
                  style={{ width: columnWidths[col], whiteSpace: 'nowrap' }}
                >
                  {col} {sort?.name === col && <SortIcon asc={sort.asc} />}
                </th>
              </Resizable>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="border border-gray-300">
              {table_columns.map((col) => (
                <td key={col} className="border border-gray-400 px-4 py-2" style={{ width: columnWidths[col] }}>
                  {col === 'PositiveReview' || col === 'NegativeReview' ? (
                    <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Show less">
                      {row[col]}
                    </Spoiler>
                  ) : col === 'VisitDate' ? (
                    new Date(row[col]).toLocaleDateString()
                  ) : (
                    row[col]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
}