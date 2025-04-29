import {
  ANALYZABLE_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
  findProjectColumn,
} from '@/api/project';
import {
  EffectSizeMethodEnum,
  GroupStatisticTestMethodEnum,
  SchemaColumnTypeEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';
import {
  StatisticMethodSelectField,
  EffectSizeSelectField,
  GroupStatisticMethodSelectField,
} from '@/modules/comparison/statistic-test/select-statistic-test-method';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Alert, Group } from '@mantine/core';
import React from 'react';
import { useWatch } from 'react-hook-form';
import * as Yup from 'yup';

export const VisualizationBinaryStatisticTestOnDistributionConfigSchema =
  Yup.object({
    target: Yup.string().required(),
    statistic_test_preference: Yup.string()
      .oneOf(Object.values(StatisticTestMethodEnum))
      .required(),
    effect_size_preference: Yup.string()
      .oneOf(Object.values(EffectSizeMethodEnum))
      .required(),
    main_statistic_test_preference: Yup.string()
      .oneOf(Object.values(GroupStatisticTestMethodEnum))
      .required(),
  });

export type VisualizationBinaryStatisticTestonDistributionConfigType =
  Yup.InferType<
    typeof VisualizationBinaryStatisticTestOnDistributionConfigSchema
  >;

function BinaryStatisticOnDistributionExplanation() {
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

export function VisualizationBinaryStatisticTestOnDistributionConfigForm() {
  const project = React.useContext(ProjectContext);
  const supportedColumns = filterProjectColumnsByType(
    project,
    ANALYZABLE_SCHEMA_COLUMN_TYPES,
  );

  const discriminatorColumnName = useWatch({
    name: 'column',
  });
  const targetColumnName = useWatch({
    name: 'config.target',
  });
  const targetColumn = findProjectColumn(project, targetColumnName);

  return (
    <>
      <BinaryStatisticOnDistributionExplanation />
      <ProjectColumnSelectField
        name="config.target"
        data={supportedColumns}
        label="Target"
        description="The data of this column will be the distribution that is tested."
        required
      />
      {targetColumn && (
        <React.Fragment key={targetColumnName}>
          <Group>
            <StatisticMethodSelectField
              name="config.statistic_test_preference"
              type="select"
              label="Statistic Test"
              className="flex-1"
              description="What test method do you want to use for the statistic test?"
              required
              columnType={targetColumn.type as SchemaColumnTypeEnum}
            />
            <EffectSizeSelectField
              name="config.effect_size_preference"
              type="select"
              className="flex-1"
              label="Effect Size"
              description="What effect size do you want to use in this statistic test?"
              required
              columnType={targetColumn.type as SchemaColumnTypeEnum}
            />
          </Group>
          <GroupStatisticMethodSelectField
            name="config.main_statistic_test_preference"
            type="select"
            label="Main Statistic Test"
            className="flex-1"
            description={`The test method used to test how significantly ${discriminatorColumnName} affects ${targetColumn.name}.`}
            required
            columnType={targetColumn.type as SchemaColumnTypeEnum}
          />
        </React.Fragment>
      )}
    </>
  );
}
