import { DescriptiveStatisticsModel } from '@/api/table';
import Colors from '@/common/constants/colors';
import { Group, Tooltip } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';

interface DescriptiveStatisticsTableProps {
  data: NamedData<DescriptiveStatisticsModel>[];
  loading?: boolean;
}

const TABLE_ROW_MAPPING: {
  label: string;
  name: keyof DescriptiveStatisticsModel;
  description?: string;
}[] = [
  {
    label: 'Count',
    name: 'count',
  },
  {
    label: 'Mean',
    name: 'mean',
  },
  {
    label: 'Standard Deviation',
    name: 'std',
  },
  {
    label: 'Minimum Value',
    name: 'min',
  },
  {
    label: '1st Quartile',
    name: 'q1',
  },
  {
    label: 'Median',
    name: 'median',
  },
  {
    label: '3rd Quartile',
    name: 'q3',
  },
  {
    label: 'Maximum Value',
    name: 'max',
  },
  {
    label: 'Inlier Range',
    name: 'inlier_range',
    description:
      'This range contains all values that can be reasonably considered to be inliers. Values outside of this range will be counted as outliers.',
  },
  {
    label: 'Outlier Count',
    name: 'outlier_count',
  },
];

const LABEL_KEY = '__mrt__descriptive-statistics__label';

function useDescriptiveStatisticsTableData(
  props: DescriptiveStatisticsTableProps,
) {
  const { data } = props;
  return React.useMemo(() => {
    return TABLE_ROW_MAPPING.map((row) => {
      const rowData: Record<string, any> = {};
      for (const column of data) {
        rowData[column.name] = column.data[row.name];
      }
      return rowData;
    });
  }, [data]);
}

function useDescriptiveStatisticsTableColumns(
  props: DescriptiveStatisticsTableProps,
) {
  const { data } = props;
  return React.useMemo<MRT_ColumnDef<Record<string, any>>[]>(() => {
    return [
      {
        accessorKey: LABEL_KEY,
        header: 'Label',
        size: 120,
        Cell({ row: { index } }) {
          const labelData = TABLE_ROW_MAPPING[index]!;
          return (
            <Group gap={4}>
              {labelData.label}
              {labelData.description ? (
                <Tooltip label={labelData.description}>
                  <Info size={16} color={Colors.sentimentInfo} />
                </Tooltip>
              ) : undefined}
            </Group>
          );
        },
      },
      ...data.map((item) => {
        return {
          accessorKey: item.name,
          header: item.name,
          size: 120,
        };
      }),
    ];
  }, [data]);
}

export function DescriptiveStatisticsTableComponent(
  props: DescriptiveStatisticsTableProps,
) {
  const { loading } = props;
  const data = useDescriptiveStatisticsTableData(props);
  const columns = useDescriptiveStatisticsTableColumns(props);
  console.log(data, props.data);

  const table = useMantineReactTable<Record<string, any>>({
    data,
    columns,
    state: {
      isLoading: loading,
    },
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enablePagination: false,
    layoutMode: 'grid',
  });

  return <MantineReactTable table={table} />;
}

export function DescriptiveStatisticsTableDashboardComponent(
  props: BaseVisualizationComponentProps<DescriptiveStatisticsModel, object>,
) {
  return (
    <DescriptiveStatisticsTableComponent data={props.data} loading={false} />
  );
}
