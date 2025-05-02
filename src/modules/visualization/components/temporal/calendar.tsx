import {
  Card,
  ColorSwatch,
  Group,
  HoverCard,
  List,
  Select,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import {
  Calendar,
  type CalendarProps,
  type CalendarLevel,
} from '@mantine/dates';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import { fromPairs, groupBy, max, mean, sum, uniqBy } from 'lodash-es';
import chroma from 'chroma-js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import dayjs from 'dayjs';
import React from 'react';
import {
  CalendarAggregateMethodEnum,
  VisualizationCalendarConfigType,
} from '../../configuration/calendar';
import { useVisualizationSubdatasetSelect } from '../configuration/subdatasets';
import { PlotInlineConfiguration } from '../configuration';
import { DashboardItemModel } from '@/api/userdata';

const CALENDAR_DATE_KEY_FORMAT = 'YYYY-MM-DD';
const CALENDAR_MONTH_KEY_FORMAT = 'YYYY-MM';
const CALENDAR_YEAR_KEY_FORMAT = 'YYYY';

function buildDateTally(dates: dayjs.Dayjs[], format: string) {
  const groupedDates = groupBy(dates.map((date) => date.format(format)));
  const dateFrequencies = Object.entries(groupedDates).map(([key, dates]) => {
    const frequency = dates.length;
    return [key, frequency] as [string, number];
  });
  return fromPairs(dateFrequencies);
}

interface CalendarPerSubdatasetListProps {
  data: NamedData<number>[];
}
interface CalendarPerSubdatasetHoverCardProps
  extends CalendarPerSubdatasetListProps {
  children?: React.ReactNode;
}

function CalendarPerSubdatasetList(props: CalendarPerSubdatasetListProps) {
  const { data } = props;
  const { colors } = generateColorsFromSequence(data);
  return (
    <List>
      {data.map((subdataset, index) => {
        const color = colors[index]!;
        return (
          <List.Item key={subdataset.name}>
            <Group align="start">
              <ColorSwatch color={color!} />
              <Text>{subdataset.name}</Text>
              <Text>Contains {subdataset.data} items</Text>
            </Group>
          </List.Item>
        );
      })}
    </List>
  );
}

function CalendarPerSubdatasetHoverCard(
  props: CalendarPerSubdatasetHoverCardProps,
) {
  const { children } = props;
  return (
    <HoverCard position="right">
      <HoverCard.Target>
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <CalendarPerSubdatasetList {...props} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

function useVisualizationCalendarMode(
  props: BaseVisualizationComponentProps<
    string[],
    VisualizationCalendarConfigType
  >,
) {
  const { data, item } = props;
  const { selectProps, viewedIndex } = useVisualizationSubdatasetSelect({
    data,
  });
  const aggregate = React.useCallback(
    (frequencies: number[]): [number, number] => {
      switch (item.config.aggregation_method) {
        case CalendarAggregateMethodEnum.Max: {
          let index = 0;
          let maxValue = 0;
          for (let i = 0; i < index; i++) {
            if (maxValue > frequencies[i]!) {
              index = i;
              maxValue = frequencies[i]!;
            }
          }
          return [maxValue, index];
        }
        case CalendarAggregateMethodEnum.Mean: {
          return [mean(frequencies) ?? 0, -1];
        }
        case CalendarAggregateMethodEnum.Median: {
          if (frequencies.length === 1) {
            return [frequencies[0] ?? 0, -1];
          }
          const middleIndex = Math.floor(frequencies.length / 2);
          const median = Math.round(
            (frequencies[middleIndex]! + frequencies[middleIndex + 1]!) / 2,
          );
          return [median, -1];
        }
        case CalendarAggregateMethodEnum.Min: {
          let index = 0;
          let minValue = 0;
          for (let i = 0; i < index; i++) {
            if (minValue < frequencies[i]!) {
              index = i;
              minValue = frequencies[i]!;
            }
          }
          return [minValue, index];
        }
        case CalendarAggregateMethodEnum.Specific: {
          if (viewedIndex == null) return [0, -1];
          return [frequencies[viewedIndex] ?? 0, viewedIndex];
        }
        case CalendarAggregateMethodEnum.Total: {
          return [sum(frequencies), -1];
        }
      }
    },
    [item.config.aggregation_method, viewedIndex],
  );
  let Component: React.ReactNode = undefined;
  if (
    item.config.aggregation_method === CalendarAggregateMethodEnum.Specific &&
    data.length > 1
  ) {
    Component = (
      <Select
        {...selectProps}
        label="Subdataset"
        description="Choose a subdataset to view its frequencies per date"
      />
    );
  }
  return { aggregate, Component };
}

interface VisualizationCalendarRendererProps {
  data: NamedData<Record<string, number>>[];
  item: DashboardItemModel;

  level: CalendarLevel;
  date: Date | undefined;
  setLevel: React.Dispatch<React.SetStateAction<CalendarLevel>>;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;

  minDate: Date | undefined;
  maxDate: Date | undefined;

  dates: dayjs.Dayjs[];
  aggregate(frequencies: number[]): [number, number];
}

function VisualizationCalendarRenderer(
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

  const [aggregateFrequencies, aggregateColors] = React.useMemo(() => {
    const aggregateFrequencies: Record<string, number> = {};
    const aggregateColors: Record<string, number> = {};
    for (const date of dates) {
      const dateKey = date.format(CALENDAR_DATE_KEY_FORMAT);
      const frequenciesPerSubdatasets = data.map(
        (subdataset) => subdataset.data[dateKey] ?? 0,
      );
      const [aggregateFrequency, color] = aggregate(frequenciesPerSubdatasets);
      aggregateFrequencies[dateKey] = aggregateFrequency;
      aggregateColors[dateKey] = color;
    }
    return [aggregateFrequencies, aggregateColors];
  }, [aggregate, data, dates]);

  const normalizedAggregateFrequencies = React.useMemo(() => {
    const maxValue = max(Object.values(aggregateFrequencies)) ?? 0;
    return fromPairs(
      Object.entries(aggregateFrequencies).map((entry) => [
        entry[0],
        entry[1] / maxValue,
      ]),
    );
  }, [aggregateFrequencies]);

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
      const dayFrequencies = data.map((subdataset) => {
        return {
          name: subdataset.name,
          data: subdataset.data[dateKey] ?? 0,
        };
      });

      return (
        <CalendarPerSubdatasetHoverCard data={dayFrequencies}>
          {date.getDate()}
        </CalendarPerSubdatasetHoverCard>
      );
    },
    [data],
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

interface VisualizationTallyCardProps {
  date: Date | undefined;
  level: CalendarLevel;
  monthTallies: NamedData<Record<string, number>>[];
  yearTallies: NamedData<Record<string, number>>[];
}

function VisualizationCalendarTallyCard(props: VisualizationTallyCardProps) {
  const { date, level, monthTallies, yearTallies } = props;

  const monthFrequencies = React.useMemo(() => {
    const dateKey = dayjs(date).format(CALENDAR_MONTH_KEY_FORMAT);
    const frequencies = monthTallies.map((subdataset) => {
      return {
        name: subdataset.name,
        data: subdataset.data[dateKey] ?? 0,
      };
    });
    return frequencies;
  }, [date, monthTallies]);
  const yearFrequencies = React.useMemo(() => {
    const dateKey = dayjs(date).format(CALENDAR_YEAR_KEY_FORMAT);
    const frequencies = yearTallies.map((subdataset) => {
      return {
        name: subdataset.name,
        data: subdataset.data[dateKey] ?? 0,
      };
    });
    return frequencies;
  }, [date, yearTallies]);

  if (!date) return;
  return (
    <Card className="overflow-y-auto min-w-96">
      {level === 'month' ? (
        <Stack>
          <Text size="lg" fw={500}>
            {dayjs(date).format('MMMM YYYY')}
          </Text>
          <CalendarPerSubdatasetList data={monthFrequencies} />
        </Stack>
      ) : level === 'year' ? (
        <Stack>
          <Text size="lg" fw={500}>
            {dayjs(date).format('YYYY')}
          </Text>
          <CalendarPerSubdatasetList data={yearFrequencies} />
        </Stack>
      ) : null}
    </Card>
  );
}

export default function VisualizationCalendarComponent(
  props: BaseVisualizationComponentProps<
    string[],
    VisualizationCalendarConfigType
  >,
) {
  const { data, item } = props;
  const { Component, aggregate } = useVisualizationCalendarMode(props);

  const parsedDates = React.useMemo<NamedData<dayjs.Dayjs[]>[]>(() => {
    return data.map((subdataset) => {
      return {
        name: subdataset.name,
        data: subdataset.data
          .map((rawDate) => dayjs(rawDate))
          .filter((date) => date.isValid()),
      };
    });
  }, [data]);

  const uniqueDates = React.useMemo(() => {
    return uniqBy(
      parsedDates.flatMap((data) => data.data),
      (date) => date.unix(),
    );
  }, [parsedDates]);

  const [minDate, maxDate] = React.useMemo(() => {
    let minDate: dayjs.Dayjs | undefined = undefined;
    let maxDate: dayjs.Dayjs | undefined = undefined;
    for (const date of uniqueDates) {
      if (!maxDate || date.isAfter(maxDate)) {
        maxDate = date;
      }
      if (!minDate || date.isBefore(minDate)) {
        minDate = date;
      }
    }
    return [minDate?.toDate(), maxDate?.toDate()];
  }, [uniqueDates]);

  const dateTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return {
        name: subdataset.name,
        data: buildDateTally(subdataset.data, CALENDAR_DATE_KEY_FORMAT),
      };
    });
  }, [parsedDates]);

  const monthTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return {
        name: subdataset.name,
        data: buildDateTally(subdataset.data, CALENDAR_MONTH_KEY_FORMAT),
      };
    });
  }, [parsedDates]);

  const yearTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return {
        name: subdataset.name,
        data: buildDateTally(subdataset.data, CALENDAR_YEAR_KEY_FORMAT),
      };
    });
  }, [parsedDates]);

  const [level, setLevel] = React.useState<CalendarLevel>('month');
  const [date, setDate] = React.useState<Date | undefined>(minDate);

  return (
    <Stack>
      {Component && (
        <PlotInlineConfiguration>{Component}</PlotInlineConfiguration>
      )}
      <Group align="stretch">
        <VisualizationCalendarRenderer
          aggregate={aggregate}
          data={dateTallies}
          item={item}
          dates={uniqueDates}
          minDate={minDate}
          maxDate={maxDate}
          date={date}
          level={level}
          setDate={setDate}
          setLevel={setLevel}
        />
        <VisualizationCalendarTallyCard
          date={date}
          level={level}
          monthTallies={monthTallies}
          yearTallies={yearTallies}
        />
      </Group>
    </Stack>
  );
}
