import { DescriptiveStatisticsModel } from '@/api/table';
import Colors from '@/common/constants/colors';
import { Group, Tooltip } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import { BaseVisualizationComponentProps } from '../../types';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';

interface DescriptiveStatisticsTableProps
  extends BaseVisualizationComponentProps<DescriptiveStatisticsModel, object> {
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
      const rowData: Record<string, any> = {
        [LABEL_KEY]: row.label,
      };
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
        Cell({ row: { original } }) {
          return (
            <Group>
              {original.label}
              {original.description ? (
                <Tooltip label={original.description}>
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

export function DescriptiveStatisticsTable(
  props: DescriptiveStatisticsTableProps,
) {
  const { loading } = props;
  const data = useDescriptiveStatisticsTableData(props);
  const columns = useDescriptiveStatisticsTableColumns(props);

  const table = useMantineReactTable<Record<string, any>>({
    data,
    columns,
    state: {
      isLoading: loading,
    },
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
  });

  return <MantineReactTable table={table} />;
}
