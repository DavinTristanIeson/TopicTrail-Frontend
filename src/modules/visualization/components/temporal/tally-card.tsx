import {
  Alert,
  Card,
  ColorSwatch,
  Divider,
  Group,
  List,
  Stack,
  Text,
} from '@mantine/core';
import { type CalendarLevel } from '@mantine/dates';
import dayjs from 'dayjs';
import React from 'react';
import { NamedData } from '../../types/base';
import {
  CALENDAR_MONTH_KEY_FORMAT,
  useCalendarAggregateFrequencies,
  CALENDAR_YEAR_KEY_FORMAT,
} from './hooks';
import { generateColorsFromSequence } from '@/common/utils/colors';
import {
  CalendarAggregateMethodEnum,
  VISUALIZATION_CALENDAR_AGGREGATION_METHOD_DICTIONARY,
  VisualizationCalendarConfigType,
} from '../../configuration/calendar';
import { DashboardItemModel } from '@/api/userdata';
import { Empty } from '@phosphor-icons/react';

export interface CalendarPerSubdatasetListProps {
  data: NamedData<number>[];
  aggregateValue: number;
  aggregateMethod: CalendarAggregateMethodEnum;
}

export function CalendarPerSubdatasetList(
  props: CalendarPerSubdatasetListProps,
) {
  const { data, aggregateMethod, aggregateValue } = props;
  const { colors } = generateColorsFromSequence(data);
  const aggregateLabel =
    VISUALIZATION_CALENDAR_AGGREGATION_METHOD_DICTIONARY[aggregateMethod]
      ?.label ?? 'Aggregate';

  return (
    <List className="overflow-y-auto">
      {data.length === 0 && (
        <Alert color="yellow" icon={<Empty />}>
          There are no rows in this time period.
        </Alert>
      )}
      {data.map((subdataset, index) => {
        const color = colors[index]!;
        if (subdataset.data === 0) return null;
        return (
          <List.Item key={subdataset.name}>
            <Group align="start">
              <ColorSwatch color={color!} />
              <Text fw={500}>{subdataset.name}</Text>
              <Text>contains {subdataset.data} rows</Text>
            </Group>
          </List.Item>
        );
      })}
      {data.length > 1 && (
        <>
          <Divider className="my-3" />
          <List.Item>
            <Group align="start">
              <Text fw={500} size="lg">
                {aggregateLabel}
              </Text>
              <Text size="lg">{aggregateValue} rows</Text>
            </Group>
          </List.Item>
        </>
      )}
    </List>
  );
}

interface VisualizationTallyCardProps {
  item: DashboardItemModel<VisualizationCalendarConfigType>;

  date: Date | undefined;
  level: CalendarLevel;

  monthTallies: NamedData<Record<string, number>>[];
  yearTallies: NamedData<Record<string, number>>[];

  dates: dayjs.Dayjs[];
  aggregate(frequencies: number[]): [number, number];
}

export default function VisualizationCalendarTallyCard(
  props: VisualizationTallyCardProps,
) {
  const { date, level, monthTallies, yearTallies, aggregate, dates, item } =
    props;

  const chosenTallies = React.useMemo(() => {
    return level === 'month'
      ? monthTallies
      : level === 'year'
        ? yearTallies
        : [];
  }, [level, monthTallies, yearTallies]);

  const chosenDateKeyFormat =
    level === 'month'
      ? CALENDAR_MONTH_KEY_FORMAT
      : level === 'year'
        ? CALENDAR_YEAR_KEY_FORMAT
        : undefined;

  const chosenDateKey = dayjs(date).format(chosenDateKeyFormat);
  const chosenFrequencies = React.useMemo(() => {
    if (!chosenDateKeyFormat) {
      return [];
    }
    const frequencies = chosenTallies.map((subdataset) => {
      return {
        name: subdataset.name,
        data: subdataset.data[chosenDateKey] ?? 0,
      };
    });
    return frequencies;
  }, [chosenDateKey, chosenDateKeyFormat, chosenTallies]);

  const { aggregateFrequencies } = useCalendarAggregateFrequencies({
    aggregate,
    data: chosenTallies ?? [],
    dates,
    dateKeyFormat: chosenDateKeyFormat ?? CALENDAR_YEAR_KEY_FORMAT,
  });

  const aggregateValue = chosenDateKey
    ? (aggregateFrequencies[chosenDateKey] ?? 0)
    : 0;

  if (!date) return;
  if (level !== 'month' && level !== 'year') {
    return null;
  }
  const dateString =
    level === 'month'
      ? dayjs(date).format('MMMM YYYY')
      : dayjs(date).format('YYYY');
  return (
    <Card className="overflow-y-auto min-w-96">
      <Stack>
        <Text size="lg" fw={500}>
          {dateString}
        </Text>
        <CalendarPerSubdatasetList
          data={chosenFrequencies}
          aggregateValue={aggregateValue}
          aggregateMethod={item.config.aggregation_method}
        />
      </Stack>
    </Card>
  );
}
