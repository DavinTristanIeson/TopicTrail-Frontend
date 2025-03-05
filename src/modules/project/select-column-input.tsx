import { ProjectSchemaModel } from '@/api/project';
import Colors from '@/common/constants/colors';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import Text from '@/components/standard/text';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';
import {
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  Group,
  Select,
  SelectProps,
} from '@mantine/core';
import capitalize from 'lodash/capitalize';

export interface ProjectColumnComboboxItem extends ComboboxItem {
  data: ProjectSchemaModel;
}

function ProjectColumnComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<ProjectColumnComboboxItem>,
) {
  const { option } = combobox;
  return (
    <>
      <Group>
        <ProjectSchemaTypeIcon type={option.data.type} />
        <Text>{option.label}</Text>
      </Group>
      <Text size="sm" c={Colors.foregroundDull}>
        {capitalize(option.data.type)}
      </Text>
    </>
  );
}

interface ProjectColumnSelectInputProps {
  data: ProjectSchemaModel[];
  value: string | null;
  onChange(column: ProjectSchemaModel | null): void;
  selectProps?: Partial<SelectProps>;
}

export function ProjectColumnSelectInput(props: ProjectColumnSelectInputProps) {
  const { onChange, data, value, selectProps } = props;
  return (
    <Select
      {...selectProps}
      value={value}
      renderOption={
        ProjectColumnComboboxItemRenderer as SelectProps['renderOption']
      }
      data={data.map((item) => {
        return {
          label: item.alias ?? item.name,
          value: item.name,
          data: item,
        } as ProjectColumnComboboxItem;
      })}
      onChange={(value) => {
        onChange(value ? (data.find((x) => x.name === value) ?? null) : null);
      }}
      allowDeselect={false}
      placeholder="Pick a column"
    />
  );
}

interface ProjectColumnTypeComboboxItem extends ComboboxItem {
  value: SchemaColumnTypeEnum;
  description: string;
}

function ProjectColumnTypeComboboxItemRenderer(
  combobox: ComboboxLikeRenderOptionInput<ProjectColumnTypeComboboxItem>,
) {
  const { option } = combobox;
  return (
    <>
      <Group>
        <ProjectSchemaTypeIcon type={option.value} />
        <Text>{option.label}</Text>
      </Group>
      <Text>{option.description}</Text>
    </>
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
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.Continuous,
            label: 'Continuous',
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.Categorical,
            label: 'Categorical',
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.OrderedCategorical,
            label: 'Ordered Categorical',
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.Temporal,
            label: 'Temporal',
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.MultiCategorical,
            label: 'Temporal',
            description: '',
          },
          {
            value: SchemaColumnTypeEnum.Geospatial,
            label: 'Temporal',
            description: 'TODO',
          },
          {
            value: SchemaColumnTypeEnum.Unique,
            label: 'Unique',
            description: 'TODO',
          },
        ] as ProjectColumnTypeComboboxItem[]
      }
      renderOption={
        ProjectColumnTypeComboboxItemRenderer as SelectProps['renderOption']
      }
    />
  );
}
