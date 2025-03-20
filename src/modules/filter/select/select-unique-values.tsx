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
  projectId: string;
  error?: React.ReactNode;
  disabled?: boolean;
}

function useTableUniqueValueSelectProps(
  props: UseTableUniqueValueSelectPropsProps,
) {
  const {
    column,
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

  return {
    data: uniqueValues?.map(String) ?? [],
    disabled: controlledDisabled ?? isLoading,
    rightSection: isFetching ? <Loader size={14} /> : undefined,
    error: controlledError ?? error?.message ?? noValueError,
  };
}

interface TableUniqueValueSelectProps
  extends UseTableUniqueValueSelectPropsProps,
    Omit<SelectProps, 'data'> {}

export function TableUniqueValueSelect(props: TableUniqueValueSelectProps) {
  const selectProps = useTableUniqueValueSelectProps(props);
  const data = selectProps.data;
  if (props.value && !data.includes(props.value)) {
    data.push(props.value);
  }
  return <Select {...props} {...selectProps} data={data} />;
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

interface TableUniqueValueMultiSelectProps
  extends UseTableUniqueValueSelectPropsProps,
    Omit<MultiSelectProps, 'data'> {}

export function TableUniqueValueMultiSelect(
  props: TableUniqueValueMultiSelectProps,
) {
  const selectProps = useTableUniqueValueSelectProps(props);
  const data = props.value
    ? uniq([...props.value, ...selectProps.data])
    : selectProps.data;
  return <MultiSelect {...props} {...selectProps} data={data} />;
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
