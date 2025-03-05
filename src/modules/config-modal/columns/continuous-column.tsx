import React from 'react';
import {
  Group,
  Skeleton,
  Spoiler,
  Switch,
  Table,
  TagsInput,
  Tooltip,
} from '@mantine/core';
import Colors from '@/common/constants/colors';
import { useFormContext, useWatch } from 'react-hook-form';
import { Info } from '@phosphor-icons/react';
import { ProjectConfigFormType } from '../form-type';
import { InferDatasetDescriptiveStatisticsModel } from '@/api/project';
import {
  ProjectConfigColumnFormProps,
  useInferProjectDatasetColumn,
} from './utils';
import RHFField from '@/components/standard/fields';
import { useRHFMantineAdapter } from '@/components/standard/fields/adapter';
import { TagsFieldProps } from '@/components/standard/fields/wrapper';

function ProjectConfigColumnContinuousFormBinsInput(
  props: ProjectConfigColumnFormProps,
) {
  const NAME = `columns.${props.index}.bins`;
  const { mergedProps } = useRHFMantineAdapter<TagsFieldProps>(
    {
      name: NAME,
    },
    {
      extractEventValue(tags) {
        return tags
          .map((tag) => parseInt(tag, 10))
          .filter((tag) => !isNaN(tag))
          .sort((a, b) => a - b);
      },
    },
  );

  return <TagsInput {...mergedProps} />;
}

interface ContinuousDataDescriptiveStatisticsProps
  extends Partial<InferDatasetDescriptiveStatisticsModel> {
  loading: boolean;
}

function ContinuousDataDescriptiveStatistics(
  props: ContinuousDataDescriptiveStatisticsProps,
) {
  const tableValues = [
    {
      label: 'Count',
      value: props.count,
    },
    {
      label: 'Mean',
      value: props.mean,
    },
    {
      label: 'Standard Deviation',
      value: props.std,
    },
    {
      label: 'Minimum Value',
      value: props.min,
    },
    {
      label: '1st Quartile',
      value: props.q1,
    },
    {
      label: 'Median',
      value: props.median,
    },
    {
      label: '3rd Quartile',
      value: props.q3,
    },
    {
      label: 'Maximum Value',
      value: props.max,
    },
    {
      label: 'Inlier Range',
      value: props.inlierRange,
      description:
        'This range contains all values that can be reasonably considered to be inliers. Values outside of this range will be counted as outliers.',
    },
    {
      label: 'Outlier Count',
      value: props.outlierCount,
    },
  ];
  if (props.loading) {
    return (
      <div>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height={36} />
        ))}
      </div>
    );
  }
  return (
    <Table>
      <Table.Tr>
        <Table.Th>Type</Table.Th>
        <Table.Th>Value</Table.Th>
      </Table.Tr>
      {tableValues.map((row, index) => (
        <Table.Tr key={index}>
          <Table.Td>
            <Group>
              {row.label}
              {row.description ? (
                <Tooltip label={row.description}>
                  <Info size={16} />
                </Tooltip>
              ) : undefined}
            </Group>
          </Table.Td>
          <Table.Td>{row.value}</Table.Td>
        </Table.Tr>
      ))}
    </Table>
  );
}

export function ProjectConfigColumnContinuousForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const { data: column, loading } = useInferProjectDatasetColumn(index);
  const { setValue, control } = useFormContext<ProjectConfigFormType>();

  const BIN_COUNT_NAME = `columns.${index}.binCount` as const;
  const BIN_NAME = `columns.${index}.bins` as const;
  const rawBinCountValue = useWatch({
    name: BIN_COUNT_NAME,
    control,
  });
  const isUsingBinCount = rawBinCountValue != null;
  return (
    <>
      <Group>
        <Switch
          label={isUsingBinCount ? 'Bin Count' : 'Bins'}
          description="Specify either a number of bins to split the continuous data into, or manually specify the edges of each bins."
          checked={isUsingBinCount}
          onChange={(e) => {
            if (e.target.checked) {
              setValue(BIN_COUNT_NAME, 3);
              setValue(BIN_NAME, null);
            } else {
              setValue(BIN_COUNT_NAME, null);
              setValue(BIN_NAME, [0]);
            }
          }}
        />
        <Tooltip label="By splitting the continuous data into bins, you've effectively created another ordinal variable from the continuous data. This means that you can now use analysis methods for ordered categorical columns on the bins.">
          <Info size={14} color={Colors.sentimentInfo} />
        </Tooltip>
      </Group>
      <Spoiler
        hideLabel={'Hide Descriptive Statistics'}
        showLabel={'Show Descriptive Statistics'}
        maxHeight={100}
      >
        <ContinuousDataDescriptiveStatistics
          loading={loading}
          {...column?.descriptiveStatistics}
        />
      </Spoiler>
      {isUsingBinCount && <RHFField name="binCount" type="number" min={2} />}
      {!isUsingBinCount && (
        <ProjectConfigColumnContinuousFormBinsInput {...props} />
      )}
    </>
  );
}
