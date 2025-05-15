// +---------------+
// | CHECK DATASET |

import { DataSourceTypeEnum } from '@/common/constants/enum';
import { Flex } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';
import React from 'react';

interface ConfigureDataSourceFormProps {
  disabled: boolean;
}

function ProjectConfigDataSourceFormFieldSwitcher(
  props: ConfigureDataSourceFormProps,
) {
  const { disabled } = props;
  const { control } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: 'source.type',
    control,
  });

  if (type === DataSourceTypeEnum.CSV) {
    return (
      <RHFField
        type="text"
        name="source.delimiter"
        key="delimiter"
        label="Delimiter"
        placeholder=","
        description="The delimiter used to separate the columns in a CSV file. It's usually , or ;."
        required
        w="49%"
        disabled={disabled}
      />
    );
  }
  if (type === DataSourceTypeEnum.Excel) {
    return (
      <RHFField
        type="text"
        name="source.sheet_name"
        key="sheetName"
        label="Sheet Name"
        description="The sheet that contains the data to be analyzed."
        required
        w="49%"
        disabled={disabled}
      />
    );
  }
  return null;
}

export function ProjectConfigDataSourceFormBody(
  props: ConfigureDataSourceFormProps,
) {
  const { disabled } = props;
  return (
    <>
      <Flex gap={24}>
        <RHFField
          type="text"
          name="source.path"
          label="Dataset Path"
          placeholder="path/to/dataset"
          description={`Enter the absolute file path or relative file path (relative to the directory of the ${GlobalConfig.AppName}) to your dataset.`}
          required
          w="100%"
          disabled={disabled}
        />
        <RHFField
          type="select"
          name="source.type"
          data={[
            {
              label: 'CSV',
              value: DataSourceTypeEnum.CSV,
            },
            {
              label: 'Excel',
              value: DataSourceTypeEnum.Excel,
            },
            // {
            //   label: 'Parquet',
            //   value: DataSourceTypeEnum.Parquet,
            // },
          ]}
          clearable={false}
          label="Dataset Type"
          description="We need to know the type of the dataset so that we can properly parse its contents."
          w="100%"
          disabled={disabled}
        />
      </Flex>
      <ProjectConfigDataSourceFormFieldSwitcher {...props} />
    </>
  );
}
