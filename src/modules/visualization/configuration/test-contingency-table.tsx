import { CATEGORICAL_SCHEMA_COLUMN_TYPES } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Alert } from '@mantine/core';
import React from 'react';
import { useWatch } from 'react-hook-form';

import * as Yup from 'yup';

export const VisualizationBinaryStatisticTestOnContingencyTableConfigSchema =
  Yup.object({
    target: Yup.string().required(),
  });
export type VisualizationBinaryStatisticTestOnContingencyTableConfigType =
  Yup.InferType<
    typeof VisualizationBinaryStatisticTestOnContingencyTableConfigSchema
  >;

function BinaryStatisticOnContingencyTableExplanation() {
  const column = useWatch({
    name: 'column',
  }) as string;
  const otherColumn = useWatch({
    name: 'config.target',
  }) as string;
  return (
    <Alert color="blue" title="How does this work?">
      Each pair of unique value from &quot;{column}&quot; and &quot;
      {otherColumn}&quot; will be treated as a pair of binary variables, which
      will split the dataset into four subdatasets. These subdatasets can then
      be compared with each other using statistic tests to figure out if a pair
      of values occur more often than expected. If it does, then it may indicate
      a relationship between said unique value and the data.
    </Alert>
  );
}
export function VisualizationBinaryStatisticTestOnContingencyTableConfigForm() {
  const project = React.useContext(ProjectContext);
  const supportedColumns = React.useMemo(() => {
    const supportedColumnTypes = CATEGORICAL_SCHEMA_COLUMN_TYPES;
    return project.config.data_schema.columns.filter((column) =>
      supportedColumnTypes.includes(column.type as SchemaColumnTypeEnum),
    );
  }, [project.config.data_schema.columns]);

  const column = useWatch({
    name: 'column',
  }) as string;

  return (
    <>
      <BinaryStatisticOnContingencyTableExplanation />
      <ProjectColumnSelectField
        name="config.target"
        data={supportedColumns}
        label="Target"
        description={`Compare the unique values of ${column} with the unique values of this column.`}
        required
      />
    </>
  );
}
