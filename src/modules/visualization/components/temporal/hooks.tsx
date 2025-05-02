import dayjs from 'dayjs';
import { fromPairs, groupBy, max, mean, min, sum, uniqBy } from 'lodash-es';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import {
  CalendarAggregateMethodEnum,
  VisualizationCalendarConfigType,
} from '../../configuration/calendar';
import { useVisualizationSubdatasetSelect } from '../configuration/subdatasets';
import React from 'react';
import { Select } from '@mantine/core';

export const CALENDAR_DATE_KEY_FORMAT = 'YYYY-MM-DD';
export const CALENDAR_MONTH_KEY_FORMAT = 'YYYY-MM';
export const CALENDAR_YEAR_KEY_FORMAT = 'YYYY';

export function buildDateTally(dates: dayjs.Dayjs[], format: string) {
  const groupedDates = groupBy(dates.map((date) => date.format(format)));
  const dateFrequencies = Object.entries(groupedDates).map(([key, dates]) => {
    const frequency = dates.length;
    return [key, frequency] as [string, number];
  });
  return fromPairs(dateFrequencies);
}

export function useVisualizationCalendarMode(
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
    (originalFrequencies: number[]): [number, number] => {
      const frequencies = originalFrequencies
        .filter((frequency) => frequency > 0)
        .sort((a, b) => a - b);
      switch (item.config.aggregation_method) {
        case CalendarAggregateMethodEnum.Max: {
          const maxValue = max(frequencies) ?? 0;
          const index = originalFrequencies.indexOf(maxValue);
          return [maxValue, index];
        }
        case CalendarAggregateMethodEnum.Mean: {
          return [mean(frequencies) ?? 0, -1];
        }
        case CalendarAggregateMethodEnum.Median: {
          if (frequencies.length <= 1) {
            return [frequencies[0] ?? 0, -1];
          }
          const middleIndex = Math.floor(frequencies.length / 2);
          if (frequencies.length % 2 === 0) {
            const median = Math.round(
              (frequencies[middleIndex]! + frequencies[middleIndex + 1]!) / 2,
            );
            return [median, -1];
          } else {
            return [frequencies[middleIndex]!, -1];
          }
        }
        case CalendarAggregateMethodEnum.Min: {
          const minValue = min(frequencies) ?? 0;
          const index = originalFrequencies.indexOf(minValue);
          return [minValue, index];
        }
        case CalendarAggregateMethodEnum.Specific: {
          if (viewedIndex == null) return [0, -1];
          return [originalFrequencies[viewedIndex] ?? 0, viewedIndex];
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

interface UseCalendarAggregateFrequenciesProps {
  dates: dayjs.Dayjs[];
  data: NamedData<Record<string, number>>[];
  aggregate(frequencies: number[]): [number, number];
  dateKeyFormat: string;
}

export function useCalendarAggregateFrequencies(
  props: UseCalendarAggregateFrequenciesProps,
) {
  const { data, dates, aggregate, dateKeyFormat } = props;
  const [aggregateFrequencies, aggregateColors] = React.useMemo(() => {
    const aggregateFrequencies: Record<string, number> = {};
    const aggregateColors: Record<string, number> = {};
    for (const date of dates) {
      const dateKey = date.format(dateKeyFormat);
      const frequenciesPerSubdatasets = data.map(
        (subdataset) => subdataset.data[dateKey] ?? 0,
      );
      const [aggregateFrequency, color] = aggregate(frequenciesPerSubdatasets);
      aggregateFrequencies[dateKey] = aggregateFrequency;
      aggregateColors[dateKey] = color;
    }
    return [aggregateFrequencies, aggregateColors];
  }, [aggregate, data, dateKeyFormat, dates]);

  const normalizedAggregateFrequencies = React.useMemo(() => {
    const maxValue = max(Object.values(aggregateFrequencies)) ?? 0;
    return fromPairs(
      Object.entries(aggregateFrequencies).map((entry) => [
        entry[0],
        entry[1] / maxValue,
      ]),
    );
  }, [aggregateFrequencies]);

  return {
    aggregateFrequencies,
    normalizedAggregateFrequencies,
    aggregateColors,
  };
}

export function usePrepareCalendarTallies(data: NamedData<string[]>[]) {
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

  return {
    dates: uniqueDates,
    minDate,
    maxDate,
    dateTallies,
    monthTallies,
    yearTallies,
  };
}
