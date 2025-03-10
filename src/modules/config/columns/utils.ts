import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { client } from '@/common/api/client';
import { DataSourceTypeEnum } from '@/common/constants/enum';
import { ProjectCheckDatasetInput } from '@/api/project';

export function transformDataSourceFormType2DataSourceInput(
  source: ProjectConfigFormType['source'],
): ProjectCheckDatasetInput {
  switch (source.type) {
    case DataSourceTypeEnum.CSV:
      return {
        type: source.type,
        path: source.path,
        delimiter: source.delimiter!,
      };
    case DataSourceTypeEnum.Excel:
      return {
        type: source.type,
        path: source.path,
        sheet_name: source.sheet_name!,
      };
    case DataSourceTypeEnum.Parquet:
      return {
        type: source.type,
        path: source.path,
      };
  }
}

export function useInferProjectDatasetColumn(index: number) {
  const { control } = useFormContext<ProjectConfigFormType>();
  const [source, name, type] = useWatch({
    control,
    name: ['source', `columns.${index}.name`, `columns.${index}.type`],
  });

  const {
    formState: { disabled },
  } = useFormContext();
  const { data: column, isFetching } = client.useQuery(
    'post',
    '/projects/check-dataset-column',
    {
      body: {
        column: name,
        dtype: type,
        source: transformDataSourceFormType2DataSourceInput(source),
      },
    },
    {
      enabled: !disabled,
    },
  );
  return { data: column?.data, loading: isFetching };
}

export interface ProjectConfigColumnFormProps {
  index: number;
}
