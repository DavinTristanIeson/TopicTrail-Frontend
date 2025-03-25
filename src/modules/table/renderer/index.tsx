import { SchemaColumnModel } from '@/api/project';
import { TableSortModel } from '@/api/table';
import React from 'react';
import { Text, Table, ScrollArea, Spoiler } from '@mantine/core';

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
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        className="border border-gray-300"
      >
        <thead className="bg-gray-100 border border-gray-400">
          <tr>
            {[
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
            ].map((col) => (
              <th
                key={col}
                className="border border-gray-400 px-4 py-2 cursor-pointer"
                onClick={() => handleSort(col)}
              >
                {col}{' '}
                {sort?.name === col && <SortIcon asc={sort.asc} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="border border-gray-300">
              {[
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
              ].map((col) => (
                <td key={col} className="border border-gray-400 px-4 py-2">
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