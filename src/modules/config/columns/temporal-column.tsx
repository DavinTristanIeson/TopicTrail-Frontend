import RHFField from '@/components/standard/fields';
import { Anchor, Text } from '@mantine/core';
import { ProjectConfigColumnFormProps } from './utils';
import { TemporalColumnFeatureEnum } from '@/common/constants/enum';

const TEMPORAL_COLUMN_FEATURE_DICTIONARY = {
  [TemporalColumnFeatureEnum.Year]: {
    label: 'Year',
    value: TemporalColumnFeatureEnum.Year,
    description:
      'Enabling this feature will create an additional column that shows the year part of each column. For example, the following time 1st April 2025, 20:30 will be transformed into 2025. This may be useful if you are dealing with long-term data.',
  },
  [TemporalColumnFeatureEnum.Month]: {
    label: 'Month',
    value: TemporalColumnFeatureEnum.Month,
    description:
      'Enabling this feature will create an additional column that shows the year and month part of each column. For example, the following time 1st April 2025, 20:30 will be transformed into April 2025.',
  },
  [TemporalColumnFeatureEnum.Date]: {
    label: 'Date',
    value: TemporalColumnFeatureEnum.Date,
    description:
      "Enabling this feature will create an additional column that shows only the date (without the time part) of the data in this column. For example, the following time 1st April 2025, 20:30 will be transformed into 1st April 2025. Disable this if you don't care about date information.",
  },
  [TemporalColumnFeatureEnum.DayOfWeek]: {
    label: 'Day of Week (Aggregate)',
    value: TemporalColumnFeatureEnum.DayOfWeek,
    description:
      "Enabling this feature will create an additional column that shows the day of week of each column. This may be useful if you want to see data differences between weekends and weekdays. Disable this if you don't care about day-of-week information.",
  },
  [TemporalColumnFeatureEnum.Monthly]: {
    label: 'Month (Aggregate)',
    value: TemporalColumnFeatureEnum.Monthly,
    description:
      "Enabling this feature will create an additional column that shows ONLY the month part of each column. For example, the following time 1st April 2025, 20:30 will be transformed into April. This may be useful if you want to see data differences between seasons/months. Disable this if you don't care about seasonal information.",
  },
  [TemporalColumnFeatureEnum.Hour]: {
    label: 'Hour (Aggregate)',
    value: TemporalColumnFeatureEnum.Hour,
    description:
      "Enabling this feature will create an additional column that shows the hour part of each column. For example, the following time 1st April 2025, 20:30 will be transformed into 20:00. This may be useful if you want to see data differences between mornings, afternoons, and nights. Disable this if you don't have/care about time information.",
  },
};

export function ProjectConfigColumnTemporalForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;

  return (
    <>
      <RHFField
        type="text"
        name={`columns.${index}.datetime_format`}
        label="Datetime Format"
        description={
          <Text size="xs">
            The datetime format used for the column. You can find the reference
            for the format in here:{' '}
            <Anchor href="https://strftime.org/">https://strftime.org/</Anchor>
          </Text>
        }
      />
      <RHFField
        type="multi-select"
        name={`columns.${index}.temporal_features`}
        data={Object.values(TEMPORAL_COLUMN_FEATURE_DICTIONARY)}
        label="Column Features"
        description={`Various features related to time that may help your analysis. Please enable or disable them according to your needs.`}
      />
    </>
  );
}
