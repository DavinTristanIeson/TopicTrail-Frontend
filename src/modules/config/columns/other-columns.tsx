import RHFField from '@/components/standard/fields';
import {
  GeospatialRoleEnum,
  TemporalPrecisionEnum,
} from '@/common/constants/enum';
import FieldWatcher from '@/components/standard/fields/watcher';
import { ProjectConfigColumnFormProps } from './utils';
import { Anchor, Text } from '@mantine/core';

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
            for the format in here:
            <Anchor href="https://strftime.org/">https://strftime.org/</Anchor>
          </Text>
        }
      />
      <RHFField
        type="select"
        name={`columns.${index}.temporal_precision`}
        data={[
          {
            label: 'Date',
            value: TemporalPrecisionEnum.Date,
          },
          {
            label: 'Date & Time',
            value: TemporalPrecisionEnum.DateTime,
          },
        ]}
        label="Precision"
        description={`The level of detail used for the date-time values. Choose "Date" if you don't care about the hours/minutes/seconds; otherwise, choose "Date-Time".`}
      />
    </>
  );
}

export function ProjectConfigColumnGeospatialForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;

  return (
    <RHFField
      type="select"
      name={`columns.${index}.role`}
      label="Geospatial Orientation"
      data={[
        {
          label: 'Latitude',
          value: GeospatialRoleEnum.Latitude,
        },
        {
          label: 'Latitude',
          value: GeospatialRoleEnum.Latitude,
        },
      ]}
      description="Does this column contain latitude values or longitude values? Note that the application requires both latitude and longitude columns to be present in the dataset to perform geospatial visualizations."
    />
  );
}

export function ProjectConfigColumnMulticategoricalForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const JSON_NAME = `columns.${index}.is_json`;
  const DELIMITER_NAME = `columns.${index}.delimiter`;

  return (
    <>
      <RHFField
        type="switch"
        name={JSON_NAME}
        label="Using JSON?"
        description="Does the rows of this column contain values encoded as JSON?"
      />
      <FieldWatcher names={[JSON_NAME]}>
        {(values) => {
          if (values[JSON_NAME]) {
            return null;
          }
          return (
            <RHFField
              type="text"
              name={DELIMITER_NAME}
              label="Delimiter"
              placeholder="e.g: commas, semicolons, spaces"
              description="What characters (or strings of characters) are used to separate the categories?"
            />
          );
        }}
      </FieldWatcher>
    </>
  );
}
