import RHFField from '@/components/standard/fields';
import { GeospatialRoleEnum } from '@/common/constants/enum';
import { ProjectConfigColumnFormProps } from './utils';

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
