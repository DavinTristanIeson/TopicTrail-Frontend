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
});

export type VisualizationGeographicalPointsConfigType = Yup.InferType<
  typeof VisualizationGeographicalPointsConfigSchema
>;

export function VisualizationGeographicalPointsConfigForm() {
  const project = React.useContext(ProjectContext);
  const [latitudeColumns, longitudeColumns] = React.useMemo(() => {
    const geospatialColumns = project.config.data_schema.columns.filter(
      (column) => column.type === SchemaColumnTypeEnum.Geospatial,
    );
    const latitudeColumns = geospatialColumns.filter(
      (column) => column.role === GeospatialRoleEnum.Latitude,
    );
    const longitudeColumns = geospatialColumns.filter(
      (column) => column.role === GeospatialRoleEnum.Longitude,
    );
    return [latitudeColumns, longitudeColumns];
  }, [project.config.data_schema.columns]);
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
    </>
  );
}
