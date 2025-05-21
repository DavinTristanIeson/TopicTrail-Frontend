import { SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { filterByString, pickArrayByIndex } from '@/common/utils/iterable';
import {
  IRHFMantineAdaptable,
  useRHFMantineAdapter,
} from '@/components/standard/fields/adapter';
import { SelectFieldProps } from '@/components/standard/fields/wrapper';
import { SelectedComboboxWrapper } from '@/components/visual/select';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';
import {
  type ComboboxItem,
  type ComboboxLikeRenderOptionInput,
  type SelectProps,
  type MultiSelectProps,
  type OptionsFilter,
  Group,
  MultiSelect,
  Select,
  Text,
} from '@mantine/core';
import { capitalize } from 'lodash-es';
import React from 'react';

export interface ProjectColumnComboboxItem extends ComboboxItem {
  data: SchemaColumnModel;
}

function ProjectColumnComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<ProjectColumnComboboxItem>,
) {
  const { option, checked } = combobox;
  return (
    <SelectedComboboxWrapper checked={checked}>
      <Group>
        <ProjectSchemaTypeIcon
          type={option.data.type as SchemaColumnTypeEnum}
        />
        <Text size="sm">{option.label}</Text>
        <Text size="xs" c="gray">
          {capitalize(option.data.type)}
        </Text>
      </Group>
    </SelectedComboboxWrapper>
  );
}

function useProjectColumnSelectProps(data: SchemaColumnModel[]) {
  return {
    renderOption:
      ProjectColumnComboboxItemRenderer as SelectProps['renderOption'],
    data: data.map((item) => {
      return {
        label: item.name,
        value: item.name,
        data: item,
      } as ProjectColumnComboboxItem;
    }),
    filter: React.useCallback<OptionsFilter>((input) => {
      const data = input.options.map(
        (option) => (option as ProjectColumnComboboxItem).data,
      );
      const indices = filterByString(
        input.search,
        data.map((item) => {
          return {
            name: item.type,
            type: item.type,
          };
        }),
      );
      return pickArrayByIndex(input.options, indices);
    }, []),
    placeholder: 'Pick a column',
  };
}

interface ProjectColumnSelectInputProps
  extends Omit<SelectProps, 'onChange' | 'data'> {
  data: SchemaColumnModel[];
  value?: string | null;
  onChange?(column: SchemaColumnModel | null): void;
}

export function ProjectColumnSelectInput(props: ProjectColumnSelectInputProps) {
  const { onChange, data, ...selectProps } = props;
  const projectSelectProps = useProjectColumnSelectProps(data);
  return (
    <Select
      {...selectProps}
      {...projectSelectProps}
      onChange={(value) => {
        onChange?.(value ? (data.find((x) => x.name === value) ?? null) : null);
      }}
    />
  );
}

type ProjectColumnSelectFieldProps = ProjectColumnSelectInputProps &
  IRHFMantineAdaptable<ProjectColumnSelectInputProps>;

export function ProjectColumnSelectField(props: ProjectColumnSelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter<ProjectColumnSelectInputProps>(
    props,
    {
      extractEventValue(e) {
        return e?.name ?? '';
      },
    },
  );
  return <ProjectColumnSelectInput {...mergedProps} />;
}

interface ProjectColumnMultiSelectInputProps
  extends Omit<MultiSelectProps, 'onChange' | 'data'> {
  data: SchemaColumnModel[];
  value?: string[];
  onChange?(column: SchemaColumnModel[]): void;
}

export function ProjectColumnMultiSelectInput(
  props: ProjectColumnMultiSelectInputProps,
) {
  const { onChange, data, ...selectProps } = props;
  const projectSelectProps = useProjectColumnSelectProps(data);
  return (
    <MultiSelect
      {...selectProps}
      {...projectSelectProps}
      onChange={(values) => {
        onChange?.(
          values
            .map((value) => {
              return data.find((x) => x.name === value)!;
            })
            .filter(Boolean),
        );
      }}
    />
  );
}

type ProjectColumnMultiSelectFieldProps = ProjectColumnMultiSelectInputProps &
  IRHFMantineAdaptable<ProjectColumnMultiSelectInputProps>;

export function ProjectColumnMultiSelectField(
  props: ProjectColumnMultiSelectFieldProps,
) {
  const { mergedProps } =
    useRHFMantineAdapter<ProjectColumnMultiSelectInputProps>(props, {
      extractEventValue(e) {
        return e.map((column) => column.name);
      },
    });
  return <ProjectColumnMultiSelectInput {...mergedProps} />;
}

interface ProjectColumnTypeComboboxItem extends ComboboxItem {
  value: SchemaColumnTypeEnum;
  description: string;
}

function ProjectColumnTypeComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<ProjectColumnTypeComboboxItem>,
) {
  const { option, checked } = combobox;
  return (
    <SelectedComboboxWrapper checked={checked}>
      <div>
        <Group>
          <ProjectSchemaTypeIcon type={option.value} />
          <Text size="sm">{option.label}</Text>
        </Group>
        <Text size="xs" c="gray">
          {option.description}
        </Text>
      </div>
    </SelectedComboboxWrapper>
  );
}

export function ProjectColumnTypeSelectInput(props: SelectProps) {
  return (
    <Select
      label="Type"
      description="The type of the column. Please note that providing the wrong column type can cause the application to error."
      required
      allowDeselect={false}
      clearable={false}
      {...props}
      data={
        [
          {
            value: SchemaColumnTypeEnum.Textual,
            label: 'Textual',
            description:
              'This column contains textual data that needs to be analyzed. We will run a topic modeling algorithm on columns of type "Textual" to automatically extract common topics/themes.',
          },
          {
            value: SchemaColumnTypeEnum.Continuous,
            label: 'Continuous',
            description: 'This column contains numeric data.',
          },
          {
            value: SchemaColumnTypeEnum.Categorical,
            label: 'Categorical',
            description:
              'This column consists of a few unique unordered categories.',
          },
          {
            value: SchemaColumnTypeEnum.OrderedCategorical,
            label: 'Ordered Categorical',
            description:
              'This column consists of a few unique ordered categories.',
          },
          {
            value: SchemaColumnTypeEnum.Temporal,
            label: 'Temporal',
            description:
              'This column contains date-time data that follows a strict format (e.g.: YYYY/MM/DD).',
          },
          {
            value: SchemaColumnTypeEnum.Geospatial,
            label: 'Geospatial',
            description:
              'This column contains either the latitude or longitude values of a coordinate.',
          },
          {
            value: SchemaColumnTypeEnum.Boolean,
            label: 'Boolean',
            description:
              'This column contains binary data (such as: yes/no, positive/negative, or true/false)',
          },
          {
            value: SchemaColumnTypeEnum.Unique,
            label: 'Unique',
            description:
              'This column contains data that will not be used in the analysis.',
          },
        ] as ProjectColumnTypeComboboxItem[]
      }
      renderOption={
        ProjectColumnTypeComboboxItemRenderer as SelectProps['renderOption']
      }
    />
  );
}

export function ProjectColumnTypeSelectField(props: SelectFieldProps) {
  const { mergedProps } = useRHFMantineAdapter(props, {
    extractEventValue(e) {
      return e;
    },
  });
  return <ProjectColumnTypeSelectInput {...mergedProps} />;
}
