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
  const { data } = props;
  // TODO: Hansen
  return (
    <>
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
              <th className="border border-gray-400 px-4 py-2">Title</th>
              <th className="border border-gray-400 px-4 py-2">Positive Review</th>
              <th className="border border-gray-400 px-4 py-2">Negative Review</th>
              <th className="border border-gray-400 px-4 py-2">Score</th>
              <th className="border border-gray-400 px-4 py-2">Guest Name</th>
              <th className="border border-gray-400 px-4 py-2">Guest Country</th>
              <th className="border border-gray-400 px-4 py-2">Room Type</th>
              <th className="border border-gray-400 px-4 py-2">Number of Nights</th>
              <th className="border border-gray-400 px-4 py-2">Visit Date</th>
              <th className="border border-gray-400 px-4 py-2">Group Type</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="border border-gray-400 px-4 py-2">{row.Title}</td>
                <td className="border border-gray-400 px-4 py-2">
                  <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Show less">
                    {row.PositiveReview}
                  </Spoiler>
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Show less">
                    {row.NegativeReview}
                  </Spoiler>
                </td>
                <td className="border border-gray-400 px-4 py-2">{row.Score}</td>
                <td className="border border-gray-400 px-4 py-2">{row.GuestName}</td>
                <td className="border border-gray-400 px-4 py-2">{row.GuestCountry}</td>
                <td className="border border-gray-400 px-4 py-2">{row.RoomType}</td>
                <td className="border border-gray-400 px-4 py-2">{row.NumberOfNights}</td>
                <td className="border border-gray-400 px-4 py-2">
                  {new Date(row.VisitDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-400 px-4 py-2">{row.GroupType}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
