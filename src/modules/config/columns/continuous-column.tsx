import React from 'react';
import { Alert, List, Spoiler, Switch, Text } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { Info } from '@phosphor-icons/react';
import { ProjectConfigFormType } from '../form-type';
import {
  ProjectConfigColumnFormProps,
  useInferProjectDatasetColumn,
} from './utils';
import RHFField from '@/components/standard/fields';
import { DescriptiveStatisticsTable } from '@/modules/table/continuous/descriptive-statistics';
import { FormEditableContext } from '@/components/standard/fields/context';

function ProjectConfigColumnContinuousFormBinsPreview(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const { control } = useFormContext<ProjectConfigFormType>();
  const binEdges =
    useWatch({
      name: `columns.${index}.bins`,
      control,
    }) ?? [];
  const bins = binEdges.reduce((acc, cur, index, arr) => {
    const digitLength = Math.ceil(Math.log10(acc.length));
    const binNumber = (acc.length + 1).toString().padStart(digitLength, '0');
    const isFirst = index === 0;
    const isLast = index === arr.length - 1;
    if (isFirst) {
      acc.push(`Bin ${binNumber}: (-inf, ${cur})`);
    }
    if (isLast) {
      acc.push(`Bin ${binNumber}: (${cur}, inf)`);
    }
    if (isFirst || isLast) {
      return acc;
    }
    const prev = arr[index - 1]!;
    acc.push(`Bin ${binNumber}: (${prev}, ${cur})`);
    return acc;
  }, [] as string[]);
  return (
    <>
      {bins.length === 0 ? (
        <Text size="sm" c="red">
          At least one bin edge is required to create bins.
        </Text>
      ) : (
        <Spoiler hideLabel={'Hide Bins'} showLabel={'Show Bins'}>
          <List>
            <Text size="sm">This will produce the following bins:</Text>
            {bins.map((bin) => (
              <List.Item key={bin}>
                <Text size="sm">{bin}</Text>
              </List.Item>
            ))}
          </List>
        </Spoiler>
      )}
    </>
  );
}

function ProjectConfigColumnContinuousFormBinsInput(
  props: ProjectConfigColumnFormProps,
) {
  const NAME = `columns.${props.index}.bins`;

  return (
    <>
      <RHFField
        type="multiple-number"
        name={NAME}
        label="Bin Edges"
        description="Specify the edges of the bins here. For example: if you want to define the bins to be 3 - 18, 18 - 65, and 65 - 99. Then the bin edges should be 3, 18, 65, and 99."
      />
      <ProjectConfigColumnContinuousFormBinsPreview {...props} />
    </>
  );
}

export function ProjectConfigColumnContinuousForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const { data: column, loading } = useInferProjectDatasetColumn(index);
  const { setValue, control } = useFormContext<ProjectConfigFormType>();

  const { editable } = React.useContext(FormEditableContext);

  const BIN_COUNT_NAME = `columns.${index}.bin_count` as const;
  const BIN_NAME = `columns.${index}.bins` as const;
  const rawBinCountValue = useWatch({
    name: BIN_COUNT_NAME,
    control,
  });
  const isUsingBinCount = rawBinCountValue != null;
  return (
    <>
      <Switch
        label={isUsingBinCount ? 'Bin Count' : 'Bins'}
        description="Specify either a number of bins to split the continuous data into, or manually specify the edges of each bins."
        checked={isUsingBinCount}
        disabled={!editable}
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
      <Alert color="blue" icon={<Info size={20} />} title="Why bins?">
        By splitting the continuous data into bins, you've effectively created
        another ordinal variable from the continuous data. This means that you
        can now use analysis methods for ordered categorical columns on the
        bins.
      </Alert>
      <Spoiler
        hideLabel={'Hide Descriptive Statistics'}
        showLabel={'Show Descriptive Statistics'}
        maxHeight={100}
      >
        <Text fw="bold" ta="center">
          Descriptive Statistics of this Column
        </Text>
        <DescriptiveStatisticsTable
          loading={loading}
          {...column?.descriptive_statistics}
        />
      </Spoiler>
      {isUsingBinCount && (
        <RHFField
          name="bin_count"
          type="number"
          min={2}
          label="Bin Count"
          required
        />
      )}
      {!isUsingBinCount && (
        <ProjectConfigColumnContinuousFormBinsInput {...props} />
      )}
    </>
  );
}
