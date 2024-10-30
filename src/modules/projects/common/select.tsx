import { ProjectSchemaModel } from "@/api/project/config.model";
import { SchemaColumnTypeEnum } from "@/common/constants/enum";
import CustomizableSelect from "@/components/standard/select/customizable";
import Text from "@/components/standard/text";
import { ComboboxItem, Group } from "@mantine/core";
import {
  ChartBar,
  Clock,
  GridFour,
  Question,
  TextAUnderline,
} from "@phosphor-icons/react";

interface ProjectColumnItemData extends ComboboxItem {
  data: ProjectSchemaModel;
}

interface ProjectSchemaTypeIconProps {
  type: SchemaColumnTypeEnum | undefined;
}

export function ProjectSchemaTypeIcon(props: ProjectSchemaTypeIconProps) {
  const { type } = props;
  if (type === SchemaColumnTypeEnum.Categorical) {
    return <GridFour />;
  }
  if (type === SchemaColumnTypeEnum.Continuous) {
    return <ChartBar />;
  }
  if (type === SchemaColumnTypeEnum.Temporal) {
    return <Clock />;
  }
  if (type === SchemaColumnTypeEnum.Textual) {
    <TextAUnderline />;
  }
  return <Question />;
}

export function ProjectColumnItemRenderer(item: ProjectColumnItemData) {
  return (
    <Group>
      <ProjectSchemaTypeIcon type={item.data.type} />
      <Text>{item.label}</Text>
    </Group>
  );
}

interface ProjectColumnSelectInputProps {
  data: ProjectSchemaModel[];
  onChange(column: ProjectSchemaModel | null): void;
}

export function ProjectColumnSelectInput(props: ProjectColumnSelectInputProps) {
  const { onChange, data } = props;
  return (
    <CustomizableSelect
      ItemRenderer={ProjectColumnItemRenderer}
      data={data.map((item) => {
        return {
          label: item.name,
          value: item.name,
          data: item,
        };
      })}
      onChange={(value) => {
        onChange(value?.data ?? null);
      }}
      value={null}
    />
  );
}
