import {
  OrderedCategoricalSchemaColumnModel,
  SchemaColumnModel,
  TemporalSchemaColumnModel,
} from '@/api/project';
import {
  SchemaColumnTypeEnum,
  TemporalPrecisionEnum,
} from '@/common/constants/enum';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { TopicInfo } from '@/modules/topics/components/info';
import {
  Spoiler,
  Tooltip,
  Text,
  HoverCard,
  Group,
  Badge,
  useMantineTheme,
} from '@mantine/core';
import dayjs from 'dayjs';
import React from 'react';

function DefaultColumnCell(props: React.PropsWithChildren) {
  return <Text size="sm">{props.children}</Text>;
}

function TextualColumnCell(props: React.PropsWithChildren) {
  return (
    <Spoiler hideLabel="Show Less" showLabel="Show More">
      <DefaultColumnCell>{props.children}</DefaultColumnCell>
    </Spoiler>
  );
}

interface TemporalColumnCellProps {
  date: Date;
  precision: TemporalPrecisionEnum;
}

function TemporalColumnCellProps(props: TemporalColumnCellProps) {
  return (
    <DefaultColumnCell>
      {props.precision === TemporalPrecisionEnum.Date
        ? dayjs(props.date).format('DD MMMM YYYY')
        : dayjs(props.date).format('DD MMMM YYYY, HH:mm:ss')}
    </DefaultColumnCell>
  );
}

interface TopicColumnCellProps {
  topic: number;
  column: string;
}
function TopicColumnCell(props: TopicColumnCellProps) {
  const topicModelingResult = useTopicModelingResultOfColumn(props.column);
  if (!topicModelingResult?.result) {
    return (
      <Tooltip
        color="red"
        label="We weren't able to load the topic modeling result of this column. This may be a developer mistake. Please restart the application to try and fix this. If the problem persists, try running the topic modeling algorithm again."
      >
        <Text c="gray">{`Topic ${props.topic + 1}`}</Text>
      </Tooltip>
    );
  }
  const topic = topicModelingResult
    ? topicModelingResult.result?.topics.find(
        (topic) => topic.id === props.topic,
      )
    : undefined;

  if (!topic) {
    return (
      <Tooltip
        color="red"
        label="We weren't able to find any topic with this ID. This may be a developer mistake. Please restart the application to try and fix this. If the problem persists, try running the topic modeling algorithm again."
      >
        <Text c="gray">{`Topic ${props.topic + 1}`}</Text>
      </Tooltip>
    );
  }

  return (
    <HoverCard>
      <HoverCard.Target>
        <Text c="brand">{topic.label}</Text>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <TopicInfo {...topic} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

interface MultiCategoricalColumnCellProps {
  value: string;
}

function MultiCategoricalColumnCell(props: MultiCategoricalColumnCellProps) {
  let tags: string[];
  try {
    tags = JSON.parse(props.value);
    if (!Array.isArray(tags)) {
      return <DefaultColumnCell>{props.value}</DefaultColumnCell>;
    }
  } catch {
    return <DefaultColumnCell>{props.value}</DefaultColumnCell>;
  }

  return (
    <Group wrap="wrap">
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </Group>
  );
}

interface CategoricalColumnCellProps {
  category: string;
  categoryOrder: string[] | null;
}

function CategoricalColumnCell(props: CategoricalColumnCellProps) {
  const { colors } = useMantineTheme();
  const order = props.categoryOrder
    ? props.categoryOrder.findIndex((category) => category === props.category)
    : -1;
  return (
    <Badge
      leftSection={
        order === -1 ? undefined : (
          <Text
            className="rounded p-2"
            style={{ backgroundColor: colors.brand[6] }}
          >
            {order}
          </Text>
        )
      }
    >
      {props.category}
    </Badge>
  );
}

interface NumericColumnCellProps {
  value: number;
}

function NumericColumnCell(props: NumericColumnCellProps) {
  const { value } = props;

  return (
    <DefaultColumnCell>
      {Intl.NumberFormat('en-EN', {
        maximumSignificantDigits: 4,
      }).format(value)}
    </DefaultColumnCell>
  );
}

interface ColumnCellRendererProps {
  value: any;
  column: SchemaColumnModel;
}

export function ColumnCellRenderer(props: ColumnCellRendererProps) {
  const { column, value } = props;
  switch (column.type) {
    case SchemaColumnTypeEnum.Textual:
    case SchemaColumnTypeEnum.Unique: {
      return <TextualColumnCell>{value}</TextualColumnCell>;
    }
    case SchemaColumnTypeEnum.Continuous:
    case SchemaColumnTypeEnum.Geospatial: {
      return <NumericColumnCell value={value} />;
    }
    case SchemaColumnTypeEnum.MultiCategorical: {
      return <MultiCategoricalColumnCell value={value} />;
    }
    case SchemaColumnTypeEnum.Temporal: {
      const temporalPrecision = (column as TemporalSchemaColumnModel)
        .temporal_precision as TemporalPrecisionEnum;
      return (
        <TemporalColumnCellProps date={value} precision={temporalPrecision} />
      );
    }
    case SchemaColumnTypeEnum.Topic: {
      return <TopicColumnCell topic={props.value} column={column.name} />;
    }
    case SchemaColumnTypeEnum.OrderedCategorical:
    case SchemaColumnTypeEnum.Categorical: {
      const categoryOrder = (column as OrderedCategoricalSchemaColumnModel)
        .category_order;
      return (
        <CategoricalColumnCell
          category={props.value}
          categoryOrder={categoryOrder ?? null}
        />
      );
    }
    default: {
      return <DefaultColumnCell>{props.value}</DefaultColumnCell>;
    }
  }
}
