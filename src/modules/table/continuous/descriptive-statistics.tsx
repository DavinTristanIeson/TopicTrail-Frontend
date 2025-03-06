import { DescriptiveStatisticsModel } from '@/api/project';
import { Skeleton, Table, Group, Tooltip } from '@mantine/core';
import { Info } from '@phosphor-icons/react';

interface DescriptiveStatisticsTableProps
  extends Partial<DescriptiveStatisticsModel> {
  loading: boolean;
}

export function DescriptiveStatisticsTable(
  props: DescriptiveStatisticsTableProps,
) {
  const tableValues = [
    {
      label: 'Count',
      value: props.count,
    },
    {
      label: 'Mean',
      value: props.mean,
    },
    {
      label: 'Standard Deviation',
      value: props.std,
    },
    {
      label: 'Minimum Value',
      value: props.min,
    },
    {
      label: '1st Quartile',
      value: props.q1,
    },
    {
      label: 'Median',
      value: props.median,
    },
    {
      label: '3rd Quartile',
      value: props.q3,
    },
    {
      label: 'Maximum Value',
      value: props.max,
    },
    {
      label: 'Inlier Range',
      value: props.inlierRange,
      description:
        'This range contains all values that can be reasonably considered to be inliers. Values outside of this range will be counted as outliers.',
    },
    {
      label: 'Outlier Count',
      value: props.outlierCount,
    },
  ];
  if (props.loading) {
    return (
      <div>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height={36} />
        ))}
      </div>
    );
  }
  return (
    <Table>
      <Table.Tr>
        <Table.Th>Type</Table.Th>
        <Table.Th>Value</Table.Th>
      </Table.Tr>
      {tableValues.map((row, index) => (
        <Table.Tr key={index}>
          <Table.Td>
            <Group>
              {row.label}
              {row.description ? (
                <Tooltip label={row.description}>
                  <Info size={16} />
                </Tooltip>
              ) : undefined}
            </Group>
          </Table.Td>
          <Table.Td>{row.value}</Table.Td>
        </Table.Tr>
      ))}
    </Table>
  );
}
