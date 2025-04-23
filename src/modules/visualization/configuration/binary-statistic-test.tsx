import {
  ANALYZABLE_SCHEMA_COLUMN_TYPES,
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
} from '@/api/project';
import {
  EffectSizeMethodEnum,
  SchemaColumnTypeEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import {
  StatisticMethodSelectField,
  EffectSizeSelectField,
} from '@/modules/comparison/statistic-test/select-statistic-test-method';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Alert, Group } from '@mantine/core';
import React from 'react';
import { useWatch } from 'react-hook-form';
import * as Yup from 'yup';

export const VisualizationBinaryStatisticTestConfigSchema = Yup.object({
  target: Yup.string().required(),
  statistic_test_preference: Yup.string()
    .oneOf(Object.values(StatisticTestMethodEnum))
    .required(),
  effect_size_preference: Yup.string()
    .oneOf(Object.values(EffectSizeMethodEnum))
    .required(),
});

export type VisualizationBinaryStatisticTestConfigType = Yup.InferType<
  typeof VisualizationBinaryStatisticTestConfigSchema
>;

interface VisualizationBinaryStatisticTestBaseConfigFormProps {
  type: 'distribution' | 'contingency-table';
}

function BinaryStatisticExplanation() {
  const column = useWatch({
    name: 'column',
  }) as string;
  const otherColumn = useWatch({
    name: 'config.target',
  }) as string;
  return (
    <Alert color="blue" title="How does this work?">
      Each unique value from &quot;{column}&quot; will be treated as a binary
      variable, which will split the data of &quot;{otherColumn}&quot; into two
      subdatasets (either the value exists or it doesn&apos;t). These
      subdatasets can then be compared with each other using statistic tests to
      figure out if the presence/absence of that unique value (e.g.: a category,
      a topic) affects the data distribution or not. If it does, then it may
      indicate a relationship between said unique value and the data.
    </Alert>
  );
}

function VisualizationBinaryStatisticTestBaseConfigForm(
  props: VisualizationBinaryStatisticTestBaseConfigFormProps,
) {
  const { type } = props;
  const project = React.useContext(ProjectContext);
  const supportedColumns = React.useMemo(() => {
    const supportedColumnTypes =
      type === 'contingency-table'
        ? CATEGORICAL_SCHEMA_COLUMN_TYPES
        : ANALYZABLE_SCHEMA_COLUMN_TYPES;
    return project.config.data_schema.columns.filter((column) =>
      supportedColumnTypes.includes(column.type as SchemaColumnTypeEnum),
    );
  }, [project.config.data_schema.columns, type]);

  const columnValue = useWatch({
    name: 'config.target',
  });
  const column = React.useMemo(() => {
    return project.config.data_schema.columns.find(
      (column) => column.name === columnValue,
    );
  }, [columnValue, project.config.data_schema.columns]);

  return (
    <>
      <BinaryStatisticExplanation />
      <ProjectColumnSelectField
        name="config.target"
        data={supportedColumns}
        label="Target"
        description="The data of this column will be the distribution that is tested."
        required
      />
      {column && (
        <Group>
          <StatisticMethodSelectField
            name="config.statistic_test_preference"
            type="select"
            label="Statistic Test"
            className="flex-1"
            description="What test method do you want to use for the statistic test?"
            required
            columnType={column.type as SchemaColumnTypeEnum}
          />
          <EffectSizeSelectField
            name="config.effect_size_preference"
            type="select"
            className="flex-1"
            label="Effect Size"
            description="What effect size do you want to use in this statistic test?"
            required
            columnType={column.type as SchemaColumnTypeEnum}
          />
        </Group>
      )}
    </>
  );
}

export function VisualizationBinaryStatisticTestOnDistributionConfigForm() {
  return <VisualizationBinaryStatisticTestBaseConfigForm type="distribution" />;
}

export function VisualizationBinaryStatisticTestOnContingencyTableConfigForm() {
  return (
    <VisualizationBinaryStatisticTestBaseConfigForm type="contingency-table" />
  );
}
