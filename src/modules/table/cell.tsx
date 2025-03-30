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
  Box,
} from '@mantine/core';
import dayjs from 'dayjs';
import React from 'react';

function DefaultColumnCell(props: React.PropsWithChildren) {
  return <Text size="sm">{props.children}</Text>;
}

interface HighlightedCellProps {
  dull?: boolean;
  children?: React.ReactNode;
}

const HighlightedCell = React.forwardRef<HTMLDivElement, HighlightedCellProps>(
  function HighlightedCell(props, ref) {
    return (
      <Box
        bg={props.dull ? 'gray.6' : 'brand.6'}
        c="white"
        className="p-2 rounded"
        ref={ref}
      >
        <Text size="sm" fw={500}>
          {props.children}
        </Text>
      </Box>
    );
  },
);

export function TextualColumnCell(props: React.PropsWithChildren) {
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
export function TopicColumnCell(props: TopicColumnCellProps) {
  const topicModelingResult = useTopicModelingResultOfColumn(props.column);
  if (!topicModelingResult?.result) {
    return (
      <Tooltip
        color="red"
        label="We weren't able to load the topic modeling result of this column. This may be a developer mistake. Please restart the application to try and fix this. If the problem persists, try running the topic modeling algorithm again."
        className="max-w-sm"
        multiline
      >
        <HighlightedCell dull>{`Topic ${props.topic + 1}`}</HighlightedCell>
      </Tooltip>
    );
  }

  if (props.topic === -1 || props.topic == null) {
    return (
      <Tooltip
        label="This document is considered an outlier. This means that this document cannot be grouped into one of the available topics."
        className="max-w-sm"
        multiline
      >
        <HighlightedCell dull>Outlier</HighlightedCell>
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
        className="max-w-sm"
        multiline
      >
        <HighlightedCell>{`Topic ${props.topic + 1}`}</HighlightedCell>
      </Tooltip>
    );
  }

  return (
    <HoverCard>
      <HoverCard.Target>
        <div>
          <HighlightedCell>{topic.label}</HighlightedCell>
        </div>
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
        <HighlightedCell key={tag}>{tag}</HighlightedCell>
      ))}
    </Group>
  );
}

interface CategoricalColumnCellProps {
  category: string;
  categoryOrder: string[] | null;
}

function CategoricalColumnCell(props: CategoricalColumnCellProps) {
  const order = props.categoryOrder
    ? props.categoryOrder.findIndex((category) => category === props.category)
    : -1;
  return (
    <HighlightedCell>
      {order === -1 ? undefined : (
        <Badge color="brand.4" mr={8}>
          {order + 1}
        </Badge>
      )}
      {props.category}
    </HighlightedCell>
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
      return (
        <TopicColumnCell
          topic={props.value}
          column={props.column.source_name!}
        />
      );
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
