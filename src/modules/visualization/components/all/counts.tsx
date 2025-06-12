import { VisualizationColumnCountsModel } from '@/api/table';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import React from 'react';
import {
  Card,
  ColorSwatch,
  Group,
  RingProgress,
  Stack,
  Text,
} from '@mantine/core';

function normalizeRingProgress(value: number, total: number) {
  return (value * 100) / total;
}

interface VisualizationColumnCountsColorLegendProps {
  data: NamedData<VisualizationColumnCountsModel>[];
}
function VisualizationColumnCountsColorLegend(
  props: VisualizationColumnCountsColorLegendProps,
) {
  const { data } = props;
  const hasOutlier = data.some((item) => !!item.data.outlier);
  const colorMapEntries = React.useMemo(() => {
    return {
      'Valid Rows': 'green',
      'Empty Rows': 'red',
      'Rows Outside Subdataset': 'gray',
      ...(hasOutlier && { Outliers: 'yellow' }),
    };
  }, [hasOutlier]);
  return (
    <Card className="w-fit">
      <Group gap={32}>
        {Object.entries(colorMapEntries).map(([groupName, groupColor]) => {
          return (
            <Group key={groupName!} gap={8}>
              <ColorSwatch color={groupColor!} />
              <Text>{groupName}</Text>
            </Group>
          );
        })}
      </Group>
    </Card>
  );
}

export default function VisualizationColumnCountsRingChart(
  props: BaseVisualizationComponentProps<
    VisualizationColumnCountsModel,
    object
  >,
) {
  const { data, item } = props;
  return (
    <Stack align="center">
      <Text ta="center" size="xl" fw={500}>
        Value Counts of{' '}
        <Text c="brand" inherit span>
          {item.column}
        </Text>
      </Text>
      <VisualizationColumnCountsColorLegend data={data} />
      <Group wrap="wrap" align="stretch" justify="center" className="pt-5">
        {data.map(({ name, data }) => {
          const sections = [
            {
              value: normalizeRingProgress(data.valid, data.total),
              tooltip: `Valid Rows: ${data.valid}`,
              color: 'green',
            },
            {
              value: normalizeRingProgress(
                data.invalid - (data.outlier ?? 0),
                data.total,
              ),
              tooltip: `Empty Rows: ${data.invalid}`,
              color: 'red',
            },
            {
              value: normalizeRingProgress(data.outside, data.total),
              tooltip: `Rows Outside Subdataset: ${data.outside}`,
              color: 'gray',
            },
            {
              value: normalizeRingProgress(data.outlier ?? 0, data.total),
              tooltip: `Outliers (No Topic): ${data.outlier ?? 0}`,
              color: 'yellow',
            },
          ];
          return (
            <Stack key={name} align="center" justify="space-between" w={300}>
              <Text ta="center" size="md" fw={500}>
                {name}
              </Text>
              <RingProgress
                size={280}
                thickness={40}
                label={
                  <div>
                    <Text size="lg" fw="bold" c="brand" ta="center" lh={1}>
                      {data.valid}
                      <Text c="black" span inherit>
                        /
                      </Text>
                      <Text span fw="bold" c="black" size="sm" lh={1}>
                        {data.total}
                      </Text>
                    </Text>
                    <Text c="gray" size="xs" ta="center" lh={1}>
                      rows
                    </Text>
                  </div>
                }
                sections={sections}
              />
            </Stack>
          );
        })}
      </Group>
    </Stack>
  );
}
