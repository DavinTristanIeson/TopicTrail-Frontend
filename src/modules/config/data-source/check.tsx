import { client } from '@/common/api/client';
import { transformDataSourceFormType2DataSourceInput } from '../columns/utils';
import {
  DefaultProjectSchemaColumnValues,
  ProjectConfigColumnFormType,
  ProjectConfigDataSourceFormType,
  ProjectConfigDataSourceUpdateModalFormType,
  ProjectConfigFormType,
} from '../form-type';
import { showNotification } from '@mantine/notifications';
import { formSetErrors } from '@/common/utils/form';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import React from 'react';
import fromPairs from 'lodash/fromPairs';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';

interface UseVerifyDataSourceReturn {
  onSubmit(
    data: ProjectConfigDataSourceFormType,
  ): Promise<ProjectConfigColumnFormType[]>;
  isPending: boolean;
}
function useVerifyDataSource(): UseVerifyDataSourceReturn {
  const { mutateAsync: check, isPending } = client.useMutation(
    'post',
    '/projects/check-dataset',
  );
  const { getValues } = useFormContext<ProjectConfigFormType>();

  const onSubmit = async (data: ProjectConfigFormType['source']) => {
    const res = await check({
      body: transformDataSourceFormType2DataSourceInput(data),
    });
    if (res.message) {
      showNotification({
        message: res.message,
        color: 'green',
      });
    }

    const previous = fromPairs(
      getValues('columns').map((col) => [
        col.name,
        col as ProjectConfigColumnFormType,
      ]),
    );

    const columns: ProjectConfigColumnFormType[] = res.data.columns.map(
      (column) => {
        if (previous[column.name]) {
          return previous[column.name]!;
        } else {
          return DefaultProjectSchemaColumnValues(
            column.name,
            column.type as SchemaColumnTypeEnum,
          );
        }
      },
    );
    return columns;
  };
  return { onSubmit, isPending };
}

export function useVerifyFormDataSource() {
  const { onSubmit: onSubmitBasic, isPending } = useVerifyDataSource();
  const { getValues, setError, setValue, clearErrors } =
    useFormContext<ProjectConfigFormType>();

  const onSubmit = React.useCallback(async () => {
    try {
      const source = getValues('source');
      const columns = await onSubmitBasic(source);
      setValue('columns', columns, {
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors('columns');
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          color: 'red',
          message: e.message,
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, (name, error) =>
          setError(`source.${name}` as any, error),
        );
      }
    }
  }, []);

  return { onSubmit, isPending };
}

export function useVerifyUpdateModalDataSource(
  updateModalForm: UseFormReturn<ProjectConfigDataSourceUpdateModalFormType>,
  close: () => void,
) {
  const { onSubmit: onSubmitBasic, isPending } = useVerifyDataSource();
  const { setValue, clearErrors } = useFormContext<ProjectConfigFormType>();
  const { getValues, setError } = updateModalForm;

  const onSubmit = React.useCallback(async () => {
    try {
      const source = getValues('source');
      const columns = await onSubmitBasic(source);
      setValue('columns', columns, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('source', source);
      clearErrors('columns');
      clearErrors('source');
      close();
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          color: 'red',
          message: e.message,
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, (name, error) =>
          setError(`source.${name}` as any, error),
        );
      }
    }
  }, []);

  return { onSubmit, isPending };
}
