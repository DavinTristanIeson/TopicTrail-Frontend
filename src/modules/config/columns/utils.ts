import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { client } from '@/common/api/client';
import { FormEditableContext } from '@/components/standard/fields/context';
import React from 'react';
import { ProjectDataSourceModel } from '@/api/project';

export function useInferProjectDatasetColumn(index: number) {
  const { control } = useFormContext<ProjectConfigFormType>();
  const [source, name, type] = useWatch({
    control,
    name: ['source', `columns.${index}.name`, `columns.${index}.type`],
  });

  const { editable } = React.useContext(FormEditableContext);
  const { data: column, isFetching } = client.useQuery(
    'post',
    '/projects/check-dataset-column',
    {
      body: {
        column: name,
        dtype: type!,
        source: source as ProjectDataSourceModel,
      },
    },
    {
      enabled: editable && !!type && !!source,
    },
  );
  return { data: column?.data, loading: isFetching };
}

export interface ProjectConfigColumnFormProps {
  index: number;
}
