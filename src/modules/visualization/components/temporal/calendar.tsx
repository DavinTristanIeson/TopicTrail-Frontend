import {
  Card,
  ColorSwatch,
  Group,
  HoverCard,
  List,
  Stack,
  Text,
} from '@mantine/core';
import { Calendar, type CalendarLevel } from '@mantine/dates';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import { fromPairs, groupBy, zip } from 'lodash-es';
import chroma from 'chroma-js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import dayjs from 'dayjs';
import React from 'react';

const CALENDAR_DATE_KEY_FORMAT = 'YYYY-MM-DD';
const CALENDAR_MONTH_KEY_FORMAT = 'YYYY-MM';
const CALENDAR_YEAR_KEY_FORMAT = 'YYYY';
const ACTUAL = 0;
const NORMALIZED = 1;

function buildDateTally(dates: dayjs.Dayjs[], format: string) {
  const groupedDates = groupBy(dates.map((date) => date.format(format)));
  const dateFrequencies = Object.entries(groupedDates).map(([key, dates]) => {
    const frequency = dates.length;
    return [key, frequency] as [string, number];
  });

  const maxFrequency = Math.max(...dateFrequencies.map((freq) => freq[1]), 0);
  const withNormalizedDateFrequencies = dateFrequencies.map(
    ([key, frequency]) => {
      return [key, [frequency, frequency / maxFrequency]];
    },
    [],
  );
  return fromPairs(withNormalizedDateFrequencies);
}

interface CalendarPerSubdatasetListProps {
  frequencies: [number, number][];
  data: NamedData<unknown>[];
  colors: string[];
}
interface CalendarPerSubdatasetHoverCardProps
  extends CalendarPerSubdatasetListProps {
  children?: React.ReactNode;
}

function CalendarPerSubdatasetList(props: CalendarPerSubdatasetListProps) {
  const { colors, data, frequencies } = props;
  return (
    <List>
      {zip(frequencies, data, colors).map(([freq, subdataset, color]) => {
        return (
          <List.Item key={subdataset!.name}>
            <Group align="start">
              <ColorSwatch color={color!} />
              <Text>{subdataset!.name}</Text>
              <Text>Contains {Math.floor(freq![ACTUAL])} items</Text>
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

export default function VisualizationCalendarComponent(
  props: BaseVisualizationComponentProps<string[], object>,
) {
  const { data, item } = props;

  const parsedDates = React.useMemo(() => {
    return data.map((subdataset) =>
      subdataset.data
        .map((rawDate) => dayjs(rawDate))
        .filter((date) => date.isValid()),
    );
  }, [data]);

  const dateTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return buildDateTally(subdataset, CALENDAR_DATE_KEY_FORMAT);
    });
  }, [parsedDates]);

  const monthTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return buildDateTally(subdataset, CALENDAR_MONTH_KEY_FORMAT);
    });
  }, [parsedDates]);

  const yearTallies = React.useMemo(() => {
    return parsedDates.map((subdataset) => {
      return buildDateTally(subdataset, CALENDAR_YEAR_KEY_FORMAT);
    });
  }, [parsedDates]);

  const { colors } = generateColorsFromSequence(
    data.map((subdataset) => subdataset.name),
  );
  const [minDate, maxDate] = React.useMemo(() => {
    let minDate: dayjs.Dayjs | undefined = undefined;
    let maxDate: dayjs.Dayjs | undefined = undefined;
    for (const subdataset of parsedDates) {
      for (const date of subdataset) {
        if (!maxDate || date.isAfter(maxDate)) {
          maxDate = date;
        }
        if (!minDate || date.isBefore(minDate)) {
          minDate = date;
        }
      }
    }
    return [minDate?.toDate(), maxDate?.toDate()];
  }, [parsedDates]);

  const [level, setLevel] = React.useState<CalendarLevel>('month');
  const [date, setDate] = React.useState<Date | undefined>(minDate);
  const monthFrequencies = React.useMemo(() => {
    const dateKey = dayjs(date).format(CALENDAR_MONTH_KEY_FORMAT);
    const frequencies = monthTallies.map(
      (tally) => tally[dateKey] ?? [0, 0],
    ) as [number, number][];
    return frequencies;
  }, [date, monthTallies]);
  const yearFrequencies = React.useMemo(() => {
    const dateKey = dayjs(date).format(CALENDAR_YEAR_KEY_FORMAT);
    const frequencies = yearTallies.map(
      (tally) => tally[dateKey] ?? [0, 0],
    ) as [number, number][];
    return frequencies;
  }, [date, yearTallies]);

  return (
    <Group align="stretch">
      <Calendar
        title={`Dates of ${item.column}`}
        level={level}
        date={date}
        onLevelChange={setLevel}
        onDateChange={setDate}
        static
        defaultDate={minDate}
        minDate={minDate}
        maxDate={maxDate}
        size="xl"
        getDayProps={(date) => {
          const dateKey = dayjs(date).format(CALENDAR_DATE_KEY_FORMAT);
          const frequencies = dateTallies.map(
            (tally) => tally[dateKey] ?? [0, 0],
          ) as [number, number][];
          let maxActualFrequencyIndex = 0;
          let maxActualFrequency = 0;
          for (let i = 0; i < frequencies.length; i++) {
            const actualFrequency = frequencies[i]![ACTUAL]!;
            if (actualFrequency > maxActualFrequency) {
              maxActualFrequency = actualFrequency;
              maxActualFrequencyIndex = i;
            }
          }
          // ease-out
          const opacity = frequencies[maxActualFrequencyIndex]![NORMALIZED]!;
          const color = colors[maxActualFrequencyIndex]!;

          return {
            style: {
              backgroundColor: chroma(color).alpha(opacity).hex(),
            },
          };
        }}
        renderDay={(date) => {
          const dateKey = dayjs(date).format(CALENDAR_DATE_KEY_FORMAT);
          const frequencies = dateTallies.map(
            (tally) => tally[dateKey] ?? [0, 0],
          ) as [number, number][];

          return (
            <CalendarPerSubdatasetHoverCard
              colors={colors}
              data={data}
              frequencies={frequencies}
            >
              {date.getDate()}
            </CalendarPerSubdatasetHoverCard>
          );
        }}
      />
      <Card className="overflow-y-auto min-w-96">
        {level === 'month' ? (
          <Stack>
            <Text size="lg" fw={500}>
              {dayjs(date).format('MMMM YYYY')}
            </Text>
            <CalendarPerSubdatasetList
              colors={colors}
              data={data}
              frequencies={monthFrequencies}
            />
          </Stack>
        ) : level === 'year' ? (
          <Stack>
            <Text size="lg" fw={500}>
              {dayjs(date).format('YYYY')}
            </Text>
            <CalendarPerSubdatasetList
              colors={colors}
              data={data}
              frequencies={yearFrequencies}
            />
          </Stack>
        ) : null}
      </Card>
    </Group>
  );
}
