import { SchemaColumnModel } from '@/api/project';
import {
  SchemaColumnTypeEnum,
  TableFilterTypeEnum,
} from '@/common/constants/enum';
import {
  IRHFField,
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import {
  useProjectColumn,
  useProjectColumnField,
} from '@/modules/project/columns';
import {
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  Text,
  SelectProps,
  Select,
} from '@mantine/core';
import { useWatch } from 'react-hook-form';

const ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS = [
  TableFilterTypeEnum.Empty,
  TableFilterTypeEnum.NotEmpty,
  TableFilterTypeEnum.EqualTo,
  TableFilterTypeEnum.IsOneOf,
];
const ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS = [
  ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
  TableFilterTypeEnum.GreaterThan,
  TableFilterTypeEnum.GreaterThanOrEqualTo,
  TableFilterTypeEnum.LessThan,
  TableFilterTypeEnum.LessThanOrEqualTo,
];
const ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS = [
  ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
  TableFilterTypeEnum.HasText,
];
const ALLOWED_FILTER_TYPES_FOR_COLUMNS = {
  [SchemaColumnTypeEnum.Categorical]: ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS,
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    ...ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS,
    ...ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  ],
  [SchemaColumnTypeEnum.Textual]: ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS,
  [SchemaColumnTypeEnum.Unique]: ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS,
  [SchemaColumnTypeEnum.Continuous]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Geospatial]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Temporal]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Topic]: ALLOWED_FILTER_TYPES_FOR_TEXTUAL_COLUMNS,
  [SchemaColumnTypeEnum.MultiCategorical]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.Excludes,
    TableFilterTypeEnum.Includes,
    TableFilterTypeEnum.Only,
  ],
};

function TableFilterTypeComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<ComboboxItem>,
) {
  const { option } = combobox;
  return (
    <>
      <Text>{option.label}</Text>
      <Text size="sm" c="gray">
        TODO: Description
      </Text>
    </>
  );
}

interface TableFilterTypeSelectInputProps extends Omit<SelectProps, 'data'> {
  columnType: SchemaColumnTypeEnum;
  value?: string | null;
}

export function TableFilterTypeSelectInput(
  props: TableFilterTypeSelectInputProps,
) {
  const { onChange, columnType, value, ...selectProps } = props;
  return (
    <Select
      {...selectProps}
      data={ALLOWED_FILTER_TYPES_FOR_COLUMNS[columnType] ?? []}
      value={value}
      renderOption={
        TableFilterTypeComboboxItemRenderer as SelectProps['renderOption']
      }
      allowDeselect={false}
      placeholder="Pick a column"
    />
  );
}

type TableFilterTypeSelectFieldProps = Omit<
  TableFilterTypeSelectInputProps &
    IRHFMantineAdaptable<TableFilterTypeSelectInputProps>,
  'columnType'
> & {
  targetName: string;
};
export function TableFilterTypeSelectField(
  props: TableFilterTypeSelectFieldProps,
) {
  const { targetName, ...restProps } = props;
  const column = useProjectColumnField(targetName);
  const { mergedProps } = useRHFMantineAdapter<TableFilterTypeSelectInputProps>(
    restProps,
    {
      extractEventValue(e) {
        return e;
      },
    },
  );
  if (!column) {
    return;
  }
  return (
    <TableFilterTypeSelectInput
      {...mergedProps}
      columnType={column.type as SchemaColumnTypeEnum}
    />
  );
}
