import { generateColorsFromSequence } from '@/common/utils/colors';
import { HoverCard, useMantineTheme } from '@mantine/core';
import { VisualizationCalendarConfigType } from '../../configuration/calendar';
import { NamedData } from '../../types/base';
import {
  Calendar,
  type CalendarLevel,
  type CalendarProps,
} from '@mantine/dates';
import { DashboardItemModel } from '@/api/userdata';
import chroma from 'chroma-js';
import dayjs from 'dayjs';
import React from 'react';
import {
  useCalendarAggregateFrequencies,
  CALENDAR_DATE_KEY_FORMAT,
} from './hooks';
import {
  CalendarPerSubdatasetList,
  CalendarPerSubdatasetListProps,
} from './tally-card';

interface CalendarPerSubdatasetHoverCardProps
  extends CalendarPerSubdatasetListProps {
  children?: React.ReactNode;
}

function CalendarPerSubdatasetHoverCard(
  props: CalendarPerSubdatasetHoverCardProps,
) {
  const { children, ...restProps } = props;

  return (
    <HoverCard position="right">
      <HoverCard.Target>
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <CalendarPerSubdatasetList {...restProps} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

interface VisualizationCalendarRendererProps {
  data: NamedData<Record<string, number>>[];
  item: DashboardItemModel<VisualizationCalendarConfigType>;

  level: CalendarLevel;
  date: Date | undefined;
  setLevel: React.Dispatch<React.SetStateAction<CalendarLevel>>;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;

  minDate: Date | undefined;
  maxDate: Date | undefined;

  dates: dayjs.Dayjs[];
  aggregate(frequencies: number[]): [number, number];
}

export default function VisualizationCalendarRenderer(
  props: VisualizationCalendarRendererProps,
) {
  const {
    data,
    item,
    level,
    date: controlledDate,
    minDate,
    maxDate,
    setLevel,
    setDate,
    dates,
    aggregate,
  } = props;

  const {
    aggregateColors,
    aggregateFrequencies,
    normalizedAggregateFrequencies,
  } = useCalendarAggregateFrequencies({
    aggregate,
    data,
    dates,
    dateKeyFormat: CALENDAR_DATE_KEY_FORMAT,
  });

  const { colors: mantineColors } = useMantineTheme();
  const { colors } = generateColorsFromSequence(
    data.map((subdataset) => subdataset.name),
  );

  const getDayProps = React.useCallback<
    NonNullable<CalendarProps['getDayProps']>
  >(
    (date: Date) => {
      const dateKey = dayjs(date).format(CALENDAR_DATE_KEY_FORMAT);
      const opacity = normalizedAggregateFrequencies[dateKey] ?? 0;
      if (opacity === 0) return {};
      const colorNumber = aggregateColors[dateKey] ?? -1;
      const color =
        colorNumber === -1 ? mantineColors.brand[6] : colors[colorNumber]!;
      return {
        style: {
          backgroundColor: chroma(color).alpha(opacity).hex(),
        },
      };
    },
    [
      aggregateColors,
      colors,
      mantineColors.brand,
      normalizedAggregateFrequencies,
    ],
  );

  const renderDay = React.useCallback<NonNullable<CalendarProps['renderDay']>>(
    (date) => {
      const dateKey = dayjs(date).format(CALENDAR_DATE_KEY_FORMAT);
      const aggregateValue = aggregateFrequencies[dateKey] ?? 0;
      const dayFrequencies = data.map((subdataset) => {
        return {
          name: subdataset.name,
          data: subdataset.data[dateKey] ?? 0,
        };
      });
      const isEntirelyEmpty = dayFrequencies.every(
        (subdataset) => subdataset.data === 0,
      );

      if (isEntirelyEmpty) {
        return date.getDate();
      }

      return (
        <CalendarPerSubdatasetHoverCard
          data={dayFrequencies}
          aggregateValue={aggregateValue}
          aggregateMethod={item.config.aggregation_method}
        >
          {date.getDate()}
        </CalendarPerSubdatasetHoverCard>
      );
    },
    [aggregateFrequencies, data, item.config.aggregation_method],
  );

  return (
    <Calendar
      title={`Dates of ${item.column}`}
      level={level}
      date={controlledDate}
      onLevelChange={setLevel}
      onDateChange={setDate}
      static
      defaultDate={minDate}
      minDate={minDate}
      maxDate={maxDate}
      size="xl"
      getDayProps={getDayProps}
      renderDay={renderDay}
    />
  );
}
