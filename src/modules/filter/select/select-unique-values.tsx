import { client } from '@/common/api/client';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import {
  Loader,
  MultiSelect,
  type MultiSelectProps,
  Select,
  type SelectProps,
} from '@mantine/core';
import { uniq } from 'lodash';

interface UseTableUniqueValueSelectPropsProps {
  column: string;
  value?: string | string[] | null;
  projectId: string;
  error?: React.ReactNode;
  disabled?: boolean;
}

function useTableUniqueValueSelectProps(
  props: UseTableUniqueValueSelectPropsProps,
) {
  const {
    column,
    value,
    projectId,
    error: controlledError,
    disabled: controlledDisabled,
  } = props;

  const query = client.useQuery('post', '/table/{project_id}/column/unique', {
    body: {
      filter: null,
      column,
    },
    params: {
      path: {
        project_id: projectId,
      },
    },
  });

  const { data, isLoading, isFetching, error } = query;
  const uniqueValues = data?.data.values;
  const noValueError =
    uniqueValues && uniqueValues.length === 0
      ? "Oops, this column doesn't contain any values at all!"
      : undefined;

  const selectData = uniqueValues?.filter(Boolean).map(String) ?? [];
  if (value) {
    if (Array.isArray(value)) {
      selectData.push(...value);
    } else {
      selectData.push(value);
    }
  }
  return {
    data: uniq(selectData),
    disabled: controlledDisabled ?? isLoading,
    rightSection: isFetching ? <Loader size={14} /> : undefined,
    error: controlledError ?? error?.message ?? noValueError,
  };
}

type TableUniqueValueSelectProps = Omit<
  UseTableUniqueValueSelectPropsProps,
  'value'
> &
  Omit<SelectProps, 'data'>;

export function TableUniqueValueSelect(props: TableUniqueValueSelectProps) {
  const selectProps = useTableUniqueValueSelectProps(props);
  return <Select {...props} {...selectProps} />;
}

type TableUniqueValueSelectFieldProps = TableUniqueValueSelectProps &
  IRHFMantineAdaptable<TableUniqueValueSelectProps>;
export function TableUniqueValueSelectField(
  props: TableUniqueValueSelectFieldProps,
) {
  const { mergedProps } = useRHFMantineAdapter<TableUniqueValueSelectProps>(
    props,
    {
      extractEventValue(e) {
        return e;
      },
    },
  );
  return <TableUniqueValueSelect {...mergedProps} />;
}

type TableUniqueValueMultiSelectProps = Omit<
  UseTableUniqueValueSelectPropsProps,
  'value'
> &
  Omit<MultiSelectProps, 'data'>;

export function TableUniqueValueMultiSelect(
  props: TableUniqueValueMultiSelectProps,
) {
  const selectProps = useTableUniqueValueSelectProps(props);
  return <MultiSelect {...props} {...selectProps} />;
}

type TableUniqueValueMultiSelectFieldProps = TableUniqueValueMultiSelectProps &
  IRHFMantineAdaptable<TableUniqueValueMultiSelectProps>;

export function TableUniqueValuesMultiSelectField(
  props: TableUniqueValueMultiSelectFieldProps,
) {
  const { mergedProps } =
    useRHFMantineAdapter<TableUniqueValueMultiSelectFieldProps>(props, {
      extractEventValue(e) {
        return e;
      },
    });
  return <TableUniqueValueMultiSelect {...mergedProps} />;
}
