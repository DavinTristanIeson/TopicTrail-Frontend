import { Group, Stack } from '@mantine/core';
import { type CalendarLevel } from '@mantine/dates';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { VisualizationCalendarConfigType } from '../../configuration/calendar';
import { PlotInlineConfiguration } from '../configuration';
import {
  usePrepareCalendarTallies,
  useVisualizationCalendarMode,
} from './hooks';
import VisualizationCalendarRenderer from './calendar-renderer';
import VisualizationCalendarTallyCard from './tally-card';

export default function VisualizationCalendarComponent(
  props: BaseVisualizationComponentProps<
    string[],
    VisualizationCalendarConfigType
  >,
) {
  const { data, item } = props;
  const { Component, aggregate } = useVisualizationCalendarMode(props);
  const { dateTallies, dates, maxDate, minDate, monthTallies, yearTallies } =
    usePrepareCalendarTallies(data);

  const [level, setLevel] = React.useState<CalendarLevel>('month');
  const [date, setDate] = React.useState<Date | undefined>(minDate);

  return (
    <Stack>
      {Component && (
        <PlotInlineConfiguration>{Component}</PlotInlineConfiguration>
      )}
      <Group align="stretch">
        <VisualizationCalendarRenderer
          data={dateTallies}
          item={item}
          //
          date={date}
          level={level}
          setDate={setDate}
          setLevel={setLevel}
          //
          aggregate={aggregate}
          dates={dates}
          //
          minDate={minDate}
          maxDate={maxDate}
        />
        <VisualizationCalendarTallyCard
          item={item}
          //
          date={date}
          level={level}
          //
          monthTallies={monthTallies}
          yearTallies={yearTallies}
          //
          dates={dates}
          aggregate={aggregate}
        />
      </Group>
    </Stack>
  );
}
