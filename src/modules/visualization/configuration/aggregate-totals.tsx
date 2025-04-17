import * as Yup from 'yup';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';

export const VisualizationAggregateTotalsConfigSchema = Yup.object({
  grouped_by: Yup.string().required(),
});

export type VisualizationAggregateTotalsConfigType = Yup.InferType<
  typeof VisualizationAggregateTotalsConfigSchema
>;

export function VisualizationAggregateTotalsConfigForm() {
  const project = React.useContext(ProjectContext);
  const columns = React.useMemo(() => {
    const SUPPORTED_COLUMNS = [
      SchemaColumnTypeEnum.Categorical,
      SchemaColumnTypeEnum.Temporal,
      SchemaColumnTypeEnum.OrderedCategorical,
      SchemaColumnTypeEnum.MultiCategorical,
      SchemaColumnTypeEnum.Topic,
    ];
    return project.config.data_schema.columns.filter((column) =>
      SUPPORTED_COLUMNS.includes(column.type as SchemaColumnTypeEnum),
    );
  }, [project.config.data_schema.columns]);
  return (
    <>
      <ProjectColumnSelectField
        name="config.grouped_by"
        type="select"
        label="Group by"
        data={columns}
        required
        description="Choose a column to group the data by"
        allowDeselect={false}
      />
    </>
  );
}
