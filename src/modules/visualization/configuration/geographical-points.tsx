import { filterProjectColumnsByType } from '@/api/project';
import {
  GeospatialRoleEnum,
  SchemaColumnTypeEnum,
} from '@/common/constants/enum';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import * as Yup from 'yup';

export const VisualizationGeographicalPointsConfigSchema = Yup.object({
  latitude_column: Yup.string().required(),
  longitude_column: Yup.string().required(),
  label_column: Yup.string(),
});

export type VisualizationGeographicalPointsConfigType = Yup.InferType<
  typeof VisualizationGeographicalPointsConfigSchema
>;

export function VisualizationGeographicalPointsConfigForm() {
  const project = React.useContext(ProjectContext);
  const [latitudeColumns, longitudeColumns, labelColumns] =
    React.useMemo(() => {
      const geospatialColumns = project.config.data_schema.columns.filter(
        (column) => column.type === SchemaColumnTypeEnum.Geospatial,
      );
      const latitudeColumns = geospatialColumns.filter(
        (column) => column.role === GeospatialRoleEnum.Latitude,
      );
      const longitudeColumns = geospatialColumns.filter(
        (column) => column.role === GeospatialRoleEnum.Longitude,
      );
      const labelColumns = filterProjectColumnsByType(project, [
        SchemaColumnTypeEnum.Categorical,
        SchemaColumnTypeEnum.OrderedCategorical,
        SchemaColumnTypeEnum.Unique,
      ]);
      return [latitudeColumns, longitudeColumns, labelColumns];
    }, [project]);
  return (
    <>
      <ProjectColumnSelectField
        name="config.latitude_column"
        required
        data={latitudeColumns}
        label="Latitude Column"
        allowDeselect={false}
      />
      <ProjectColumnSelectField
        name="config.longitude_column"
        required
        data={longitudeColumns}
        label="Longitude Column"
        allowDeselect={false}
      />
      <ProjectColumnSelectField
        name="config.label_column"
        data={labelColumns}
        label="Label Column"
        allowDeselect
        description="The values of this column will be used to label the locations. Please make sure that each coordinate is assigned to one label."
        clearable
      />
    </>
  );
}
