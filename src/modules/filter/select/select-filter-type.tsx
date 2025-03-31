import {
  SchemaColumnTypeEnum,
  TableFilterTypeEnum,
} from '@/common/constants/enum';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { useProjectColumnField } from '@/modules/project/columns';
import { type SelectProps, Select } from '@mantine/core';

const FILTER_COMBOBOXES = {
  [TableFilterTypeEnum.Empty]: {
    value: TableFilterTypeEnum.Empty,
    label: 'Column is empty',
    description: 'Select all rows where this column has an empty value.',
  },
  [TableFilterTypeEnum.NotEmpty]: {
    value: TableFilterTypeEnum.NotEmpty,
    label: 'Column is not empty',
    description:
      "Select all rows where this column doesn't have an empty value.",
  },
  [TableFilterTypeEnum.EqualTo]: {
    value: TableFilterTypeEnum.EqualTo,
    label: 'Column is equal to x',
    description: 'Select all rows where this column has the same value as x.',
  },
  [TableFilterTypeEnum.IsOneOf]: {
    value: TableFilterTypeEnum.IsOneOf,
    label: 'Column is one of x',
    description:
      'Select all rows where this column contains a value that exists in x.',
  },
  [TableFilterTypeEnum.GreaterThan]: {
    value: TableFilterTypeEnum.GreaterThan,
    label: 'Column is greater than x',
    description:
      'Select all rows where this column contains a value is greater than x.',
  },
  [TableFilterTypeEnum.LessThan]: {
    value: TableFilterTypeEnum.LessThan,
    label: 'Column is less than x',
    description:
      'Select all rows where this column contains a value is less than x.',
  },
  [TableFilterTypeEnum.GreaterThanOrEqualTo]: {
    value: TableFilterTypeEnum.GreaterThanOrEqualTo,
    label: 'Column is greater than or equal to x',
    description:
      'Select all rows where this column contains a value is greater than or equal to x.',
  },
  [TableFilterTypeEnum.LessThanOrEqualTo]: {
    value: TableFilterTypeEnum.LessThanOrEqualTo,
    label: 'Column is less than or equal to x',
    description:
      'Select all rows where this column contains a value is less than or equal to x.',
  },
  [TableFilterTypeEnum.HasText]: {
    value: TableFilterTypeEnum.HasText,
    label: 'Column contains text x',
    description:
      'Select all rows where this column contains a piece of text that is equal to x.',
  },
  [TableFilterTypeEnum.Excludes]: {
    value: TableFilterTypeEnum.Excludes,
    label: "Column doesn't contain x",
    description:
      "Select all rows where this column doesn't contain any categories in x.",
  },
  [TableFilterTypeEnum.Includes]: {
    value: TableFilterTypeEnum.Includes,
    label: 'Column contains x',
    description:
      'Select all rows where this column contains all categories in x; although other categories may also exist besides the ones in x.',
  },
  [TableFilterTypeEnum.Only]: {
    value: TableFilterTypeEnum.Only,
    label: 'Column only contains x',
    description:
      'Select all rows where this column only contains the categories in x. If there are other categories outside of the ones in x, the row will not be included.',
  },
  [TableFilterTypeEnum.And]: {
    value: TableFilterTypeEnum.And,
    label: 'All conditions are fulfilled',
    description:
      'Select all rows that fulfills all of the conditions of this filter.',
  },
  [TableFilterTypeEnum.Or]: {
    value: TableFilterTypeEnum.Or,
    label: 'Any conditions are fulfilled',
    description:
      'Select all rows that fulfills any of the conditions of this filter.',
  },
  [TableFilterTypeEnum.Not]: {
    value: TableFilterTypeEnum.Not,
    label: "Doesn't fulfill condition",
    description:
      "Select all rows that doesn't fulfill the condition of this filter.",
  },
};
const ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS = [
  TableFilterTypeEnum.Empty,
  TableFilterTypeEnum.NotEmpty,
  TableFilterTypeEnum.EqualTo,
];
const ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS = [
  ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
  TableFilterTypeEnum.GreaterThan,
  TableFilterTypeEnum.GreaterThanOrEqualTo,
  TableFilterTypeEnum.LessThan,
  TableFilterTypeEnum.LessThanOrEqualTo,
];

const ALLOWED_FILTER_TYPES_FOR_COLUMNS = {
  [SchemaColumnTypeEnum.Categorical]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.IsOneOf,
  ],
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    ...ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
    TableFilterTypeEnum.IsOneOf,
  ],
  [SchemaColumnTypeEnum.Textual]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.HasText,
  ],
  [SchemaColumnTypeEnum.Unique]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.HasText,
  ],
  [SchemaColumnTypeEnum.Continuous]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Geospatial]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Temporal]: ALLOWED_FILTER_TYPES_FOR_ORDERED_COLUMNS,
  [SchemaColumnTypeEnum.Topic]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.IsOneOf,
  ],
  [SchemaColumnTypeEnum.MultiCategorical]: [
    ...ALLOWED_FILTER_TYPES_FOR_ALL_COLUMNS,
    TableFilterTypeEnum.Excludes,
    TableFilterTypeEnum.Includes,
    TableFilterTypeEnum.Only,
  ],
};

export const COMPOUND_FILTER_TYPES = [
  TableFilterTypeEnum.And,
  TableFilterTypeEnum.Or,
  TableFilterTypeEnum.Not,
];

interface TableFilterTypeSelectInputProps extends Omit<SelectProps, 'data'> {
  columnType: SchemaColumnTypeEnum;
}

export function TableFilterTypeSelectInput(
  props: TableFilterTypeSelectInputProps,
) {
  const { columnType, ...selectProps } = props;
  const renderOption = useDescriptionBasedRenderOption(FILTER_COMBOBOXES);
  return (
    <Select
      {...selectProps}
      renderOption={renderOption}
      data={
        ALLOWED_FILTER_TYPES_FOR_COLUMNS[columnType]?.map((value) => {
          return FILTER_COMBOBOXES[value];
        }) ?? []
      }
      placeholder="Pick a filter type"
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

type CompoundTableFilterTypeSelectInputProps = Omit<SelectProps, 'data'>;
export function CompoundTableFilterTypeSelectInput(
  props: CompoundTableFilterTypeSelectInputProps,
) {
  const renderOption = useDescriptionBasedRenderOption(FILTER_COMBOBOXES);
  return (
    <Select
      {...props}
      data={COMPOUND_FILTER_TYPES.map((value) => {
        return FILTER_COMBOBOXES[value];
      })}
      renderOption={renderOption}
      placeholder="Pick a filter type"
    />
  );
}

type CompoundTableFilterTypeSelectFieldProps =
  CompoundTableFilterTypeSelectInputProps &
    IRHFMantineAdaptable<CompoundTableFilterTypeSelectInputProps>;

export function CompoundTableFilterTypeSelectField(
  props: CompoundTableFilterTypeSelectFieldProps,
) {
  const { mergedProps } = useRHFMantineAdapter<TableFilterTypeSelectInputProps>(
    props,
    {
      extractEventValue(e) {
        return e;
      },
    },
  );
  return <CompoundTableFilterTypeSelectInput {...mergedProps} />;
}
