import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import * as Yup from 'yup';

export enum CalendarAggregateMethodEnum {
  Total = 'total',
  Mean = 'mean',
  Median = 'median',
  Max = 'max',
  Min = 'min',
  Specific = 'specific',
}

export const VisualizationCalendarConfigSchema = Yup.object({
  aggregation_method: Yup.string()
    .oneOf(Object.values(CalendarAggregateMethodEnum))
    .required(),
});

export type VisualizationCalendarConfigType = Yup.InferType<
  typeof VisualizationCalendarConfigSchema
>;

export const VISUALIZATION_CALENDAR_AGGREGATION_METHOD_DICTIONARY = {
  [CalendarAggregateMethodEnum.Total]: {
    value: CalendarAggregateMethodEnum.Total,
    label: 'Total',
    description: 'Show the total amount of rows in the same date.',
  },
  [CalendarAggregateMethodEnum.Mean]: {
    value: CalendarAggregateMethodEnum.Mean,
    label: 'Average',
    description: 'Show the average amount of rows in the same date.',
  },
  [CalendarAggregateMethodEnum.Max]: {
    value: CalendarAggregateMethodEnum.Max,
    label: 'Max',
    description: 'Show the maximum amount of rows in the same date.',
  },
  [CalendarAggregateMethodEnum.Min]: {
    value: CalendarAggregateMethodEnum.Min,
    label: 'Min',
    description: 'Show the minimum amount of rows in the same date.',
  },
  [CalendarAggregateMethodEnum.Median]: {
    value: CalendarAggregateMethodEnum.Median,
    label: 'Median',
    description: 'Show the median amount of rows in the same date.',
  },
  [CalendarAggregateMethodEnum.Specific]: {
    value: CalendarAggregateMethodEnum.Specific,
    label: 'Specific',
    description:
      'Show the number of rows in the same date for a specific subdataset.',
  },
};

export function VisualizationCalendarConfigForm() {
  const renderOption = useDescriptionBasedRenderOption(
    VISUALIZATION_CALENDAR_AGGREGATION_METHOD_DICTIONARY,
  );
  return (
    <RHFField
      type="select"
      name="config.aggregation_method"
      label="Aggregation Method"
      description="How are the number of rows aggregated per date?"
      data={Object.values(VISUALIZATION_CALENDAR_AGGREGATION_METHOD_DICTIONARY)}
      renderOption={renderOption}
      required
      allowDeselect={false}
    />
  );
}
