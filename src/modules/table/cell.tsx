import { SchemaColumnModel, TemporalSchemaColumnModel } from '@/api/project';
import { getTopicLabel } from '@/api/topic';
import {
  SchemaColumnTypeEnum,
  TemporalPrecisionEnum,
} from '@/common/constants/enum';
import { getPlotColor } from '@/common/utils/colors';
import { useTopicModelingResultOfColumn } from '@/modules/topics/components/context';
import { TopicInfo } from '@/modules/topics/components/info';
import {
  Tooltip,
  Text,
  HoverCard,
  Box,
  useMantineTheme,
  Spoiler,
} from '@mantine/core';
import { Check, X } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import React from 'react';

function DefaultColumnCell(props: React.PropsWithChildren) {
  return <Text size="sm">{props.children}</Text>;
}

interface HighlightedCellProps {
  color?: string;
  dull?: boolean;
  children?: React.ReactNode;
}

const HighlightedCell = React.forwardRef<HTMLDivElement, HighlightedCellProps>(
  function HighlightedCell(props, ref) {
    if (!props.children) {
      return null;
    }
    return (
      <Box
        bg={props.color ? props.color : props.dull ? 'gray.6' : 'brand.6'}
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

interface TextualColumnCellProps {
  children?: React.ReactNode;
  spaceEfficient?: boolean;
}

export function TextualColumnCell(props: TextualColumnCellProps) {
  const { children: text, spaceEfficient } = props;
  if (spaceEfficient) {
    return (
      <HoverCard position="top">
        <HoverCard.Target>
          <Text size="sm" className="text-ellipsis line-clamp-2">
            {text}
          </Text>
        </HoverCard.Target>
        <HoverCard.Dropdown maw={640}>
          <Text size="sm">{text}</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    );
  } else {
    return (
      <Spoiler hideLabel="Show Less" showLabel="Show More">
        {text}
      </Spoiler>
    );
  }
}

interface TemporalColumnCellProps {
  date: Date;
  precision: TemporalPrecisionEnum | null;
}

export function formatTemporalValueByPrecision(
  rawDate: Date,
  precision: TemporalPrecisionEnum | null,
) {
  const date = dayjs(rawDate);
  if (!date.isValid()) {
    return null;
  }
  let value: string;
  switch (precision) {
    case TemporalPrecisionEnum.Year: {
      value = date.format('YYYY');
      break;
    }
    case TemporalPrecisionEnum.Month: {
      value = date.format('MMMM YYYY');
      break;
    }
    case TemporalPrecisionEnum.Date: {
      value = date.format('DD MMMM YYYY');
      break;
    }
    default: {
      value = date.format('DD MMMM YYYY, HH:mm:ss');
      break;
    }
  }
  return value;
}

function TemporalColumnCell(props: TemporalColumnCellProps) {
  if (!props.date) {
    return null;
  }
  const value = formatTemporalValueByPrecision(props.date, props.precision);
  return <DefaultColumnCell>{value}</DefaultColumnCell>;
}

interface TopicColumnCellProps {
  topic: number | null | undefined;
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
        <HighlightedCell dull>No Topic</HighlightedCell>
      </Tooltip>
    );
  }

  if (props.topic == null) {
    return (
      <Tooltip
        label="No topic was assigned to this column. This means that the document is considered invalid during the preprocessing step."
        multiline
        className="max-w-sm"
      >
        <HighlightedCell dull>No Topic</HighlightedCell>
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

  if (topic == null) {
    return (
      <Tooltip
        color="red"
        label="We weren't able to find any topic with this ID. This may be a developer mistake. Please restart the application to try and fix this. If the problem persists, try running the topic modeling algorithm again."
        className="max-w-sm"
        multiline
      >
        <HighlightedCell dull>{`Topic ${props.topic + 1}`}</HighlightedCell>
      </Tooltip>
    );
  }

  return (
    <HoverCard>
      <HoverCard.Target>
        <div>
          <HighlightedCell color={getPlotColor(topic.id)}>
            {getTopicLabel(topic)}
          </HighlightedCell>
        </div>
      </HoverCard.Target>
      <HoverCard.Dropdown className="max-w-lg">
        <TopicInfo {...topic} topicWordsLimit={null} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

interface NumericColumnCellProps {
  value: number;
}

function NumericColumnCell(props: NumericColumnCellProps) {
  const { value } = props;
  if (value == null) {
    return null;
  }

  return (
    <DefaultColumnCell>
      {Intl.NumberFormat('en-EN', {
        maximumSignificantDigits: 4,
      }).format(value)}
    </DefaultColumnCell>
  );
}

interface BooleanColumnCellProps {
  value: boolean;
}

function BooleanColumnCell(props: BooleanColumnCellProps) {
  const { colors } = useMantineTheme();
  if (props.value == null) {
    return null;
  }
  if (props.value) {
    return <Check color={colors.green[6]} weight="bold" size={24} />;
  } else {
    return <X color={colors.red[6]} weight="bold" size={24} />;
  }
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
      return <TextualColumnCell spaceEfficient>{value}</TextualColumnCell>;
    }
    case SchemaColumnTypeEnum.Continuous:
    case SchemaColumnTypeEnum.Geospatial: {
      return <NumericColumnCell value={value} />;
    }
    case SchemaColumnTypeEnum.Temporal: {
      const temporalPrecision = (column as TemporalSchemaColumnModel)
        .temporal_precision as TemporalPrecisionEnum;
      return <TemporalColumnCell date={value} precision={temporalPrecision} />;
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
      return <HighlightedCell>{props.value}</HighlightedCell>;
    }
    case SchemaColumnTypeEnum.Boolean: {
      return <BooleanColumnCell value={props.value} />;
    }
    default: {
      return <DefaultColumnCell>{props.value}</DefaultColumnCell>;
    }
  }
}
