import { client } from '@/common/api/client';
import {
  DefaultProjectSchemaColumnValues,
  ProjectConfigColumnFormType,
  ProjectConfigDataSourceFormType,
  ProjectConfigFormType,
} from '../form-type';
import { showNotification } from '@mantine/notifications';
import { formSetErrors } from '@/common/utils/form';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import React from 'react';
import { fromPairs } from 'lodash-es';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { ProjectDataSourceModel } from '@/api/project';

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
      body: data as ProjectDataSourceModel,
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

interface UseVerifyFormDataSourceProps {
  onContinue(): void;
}

export function useVerifyFormDataSource(props: UseVerifyFormDataSourceProps) {
  const { onContinue } = props;
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
      clearErrors('source');
      onContinue();
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
  }, [clearErrors, getValues, onContinue, onSubmitBasic, setError, setValue]);

  return { onSubmit, isPending };
}

interface UseVerifyUpdateModalDataSourceProps {
  localForm: UseFormReturn<{ source: ProjectConfigDataSourceFormType }>;
  onClose(): void;
}

export function useVerifyUpdateModalDataSource(
  props: UseVerifyUpdateModalDataSourceProps,
) {
  const { localForm, onClose } = props;
  const { onSubmit: onSubmitBasic, isPending } = useVerifyDataSource();
  // Global form
  const { setValue: setGlobalValue, clearErrors: clearGlobalErrors } =
    useFormContext<ProjectConfigFormType>();
  // Local form. The form inside the modal.
  const { getValues: getLocalValues, setError: setLocalError } = localForm;

  const onSubmit = React.useCallback(async () => {
    try {
      // Grab local data source state
      const source = getLocalValues('source');
      // Check data source
      const columns = await onSubmitBasic(source);

      // Set global form state
      setGlobalValue('columns', columns, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setGlobalValue('source', source);
      clearGlobalErrors('columns');
      clearGlobalErrors('source');
      onClose();
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          color: 'red',
          message: e.message,
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, (key, err) =>
          setLocalError(`source.${key}` as any, err),
        );
      }
    }
  }, [
    getLocalValues,
    onSubmitBasic,
    setGlobalValue,
    clearGlobalErrors,
    onClose,
    setLocalError,
  ]);

  return { onSubmit, isPending };
}
