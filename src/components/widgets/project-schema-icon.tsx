import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import {
  List,
  ListNumbers,
  GridFour,
  ChartBar,
  Clock,
  MapPin,
  TextAUnderline,
  Question,
} from '@phosphor-icons/react';

interface ProjectSchemaTypeIconProps {
  type: SchemaColumnTypeEnum | undefined;
}
export function ProjectSchemaTypeIcon(props: ProjectSchemaTypeIconProps) {
  const { type } = props;
  switch (type) {
    case SchemaColumnTypeEnum.Categorical:
      return <List />;
    case SchemaColumnTypeEnum.OrderedCategorical:
      return <ListNumbers />;
    case SchemaColumnTypeEnum.MultiCategorical:
      return <GridFour />;
    case SchemaColumnTypeEnum.Continuous:
      return <ChartBar />;
    case SchemaColumnTypeEnum.Temporal:
      return <Clock />;
    case SchemaColumnTypeEnum.Geospatial:
      return <MapPin />;
    case SchemaColumnTypeEnum.Topic:
      return <TextAUnderline />;
    case SchemaColumnTypeEnum.Unique:
      return <Question />;
    case SchemaColumnTypeEnum.Textual:
      return <TextAUnderline />;
  }
}
