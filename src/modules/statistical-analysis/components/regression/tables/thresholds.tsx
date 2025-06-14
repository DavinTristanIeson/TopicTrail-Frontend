import { OrdinalRegressionThresholdModel } from '@/api/statistical-analysis';
import { formatNumber } from '@/common/utils/number';
import { MantineReactTableBehaviors } from '@/modules/table/adapter';
import {
  type MRT_ColumnDef,
  useMantineReactTable,
  MantineReactTable,
} from 'mantine-react-table';
import React from 'react';
import { TooltipHeader } from './common';
import { ActionIcon, Stack, Title, Tooltip } from '@mantine/core';
import { TestTube } from '@phosphor-icons/react';
import { OrdinalRegressionConfigType } from '@/modules/statistical-analysis/configuration/multinomial-regression';
import { useComparisonAppState } from '@/modules/comparison/app-state';
import { StatisticalAnalysisPurpose } from '@/modules/statistical-analysis/types';
import { LogisticRegressionConfigType } from '@/modules/statistical-analysis/configuration/logistic-regression';
import { shrinkTableFilter } from '@/modules/filter/utils';
import { TableFilterModel } from '@/api/table';

interface RegressionThresholdLogisticRegressionButtonProps {
  config: OrdinalRegressionConfigType;
  original: OrdinalRegressionThresholdModel;
}

function RegressionThresholdLogisticRegressionButton(
  props: RegressionThresholdLogisticRegressionButtonProps,
) {
  const { config, original } = props;
  const setInput = useComparisonAppState(
    (store) => store.statisticalAnalysis.setInput,
  );
  return (
    <Tooltip label="Perform logistic regression with this threshold.">
      <ActionIcon
        variant="subtle"
        onClick={() => {
          if (config.subdatasets) {
            const index = config.subdatasets.findIndex(
              (subdataset) => subdataset.name === original.to_level,
            );
            const positiveGroup = config.subdatasets.slice(index);
            setInput({
              type: StatisticalAnalysisPurpose.LogisticRegression,
              config: {
                target: `${original.from_level}/${original.to_level}`,
                constrain_by_groups: false,
                filter: {
                  type: 'and',
                  operands: positiveGroup.map((namedFilter) => {
                    return shrinkTableFilter(
                      namedFilter.filter as TableFilterModel,
                    );
                  }),
                },
                interpretation: config.interpretation,
              } as LogisticRegressionConfigType,
            });
          } else {
            setInput({
              type: StatisticalAnalysisPurpose.LogisticRegression,
              config: {
                target: `${original.from_level}/${original.to_level}`,
                constrain_by_groups: false,
                filter: {
                  type: 'greater_than_or_equal_to',
                  target: config.target,
                  value: original.to_level,
                },
                interpretation: config.interpretation,
              } as LogisticRegressionConfigType,
            });
          }
        }}
      >
        <TestTube />
      </ActionIcon>
    </Tooltip>
  );
}

interface RegressionThresholdsTableProps {
  thresholds: OrdinalRegressionThresholdModel[];
  config: OrdinalRegressionConfigType;
}

export function RegressionThresholdsTable(
  props: RegressionThresholdsTableProps,
) {
  const { thresholds, config } = props;
  const columns = React.useMemo<
    MRT_ColumnDef<OrdinalRegressionThresholdModel>[]
  >(() => {
    return [
      {
        id: 'from_level',
        header: 'From Level',
        minSize: 200,
        Cell({ row: { original } }) {
          return original.from_level;
        },
      },
      {
        id: 'to_level',
        header: 'To Level',
        minSize: 200,
        Cell({ row: { original } }) {
          return original.to_level;
        },
      },
      {
        id: 'threshold_value',
        header: 'Threshold Value',
        minSize: 120,
        size: 120,
        enableSorting: true,
        Header: () => (
          <TooltipHeader
            tooltip="The threshold that must be reached in latent variable space to cross from the lower level to the upper level."
            title="Threshold Value"
          />
        ),
        Cell({ row: { original } }) {
          if (original.value == null) return null;
          return formatNumber(original.value);
        },
      },
      {
        id: 'logistic_regression',
        header: 'Logistic Regression',
        minSize: 50,
        size: 50,
        enableColumnActions: false,
        Header: () => null,
        Cell({ row: { original } }) {
          return (
            <RegressionThresholdLogisticRegressionButton
              config={config}
              original={original}
            />
          );
        },
      },
    ];
  }, [config]);

  const table = useMantineReactTable({
    data: thresholds,
    columns: columns,
    ...MantineReactTableBehaviors.Default,
    ...MantineReactTableBehaviors.Resizable,
    ...MantineReactTableBehaviors.ColumnActions,
    enablePagination: false,
    layoutMode: 'grid',
  });
  return (
    <Stack>
      <Title order={3}>Thresholds Table</Title>
      <MantineReactTable table={table} />
    </Stack>
  );
}
