import { useWatch } from 'react-hook-form';
import {
  CompoundTableFilterComponent,
  TableFilterComponentProps,
  TableFilterScaffold,
} from './base-component';
import {
  SchemaColumnTypeEnum,
  TableFilterTypeEnum,
} from '@/common/constants/enum';
import React from 'react';
import RHFField from '@/components/standard/fields';
import { ProjectContext } from '@/modules/project/context';
import { useProjectColumnField } from '@/modules/project/columns';
import {
  TableUniqueValueSelectField,
  TableUniqueValuesMultiSelectField,
} from '@/modules/filter/select/select-unique-values';
import {
  TopicFilterMultiSelectField,
  TopicFilterSelectField,
} from './topic-components';

function ValueBasedTableFilterComponent(props: TableFilterComponentProps) {
  const { name: name } = props;
  const project = React.useContext(ProjectContext);
  const column = useProjectColumnField(name ? `${name}.target` : 'target');

  const inputProps = {
    label: 'Value',
    required: true,
    name: name ? `${name}.value` : 'value',
  };

  if (!column) return;
  if (
    column.type === SchemaColumnTypeEnum.Categorical ||
    column.type === SchemaColumnTypeEnum.OrderedCategorical
  ) {
    // NOTE: Topic should have a separate TopicSelect component
    return (
      <TableUniqueValueSelectField
        column={column.name}
        projectId={project.id}
        {...inputProps}
      />
    );
  } else if (column.type === SchemaColumnTypeEnum.Topic) {
    return (
      <TopicFilterSelectField column={column} {...inputProps} withOutlier />
    );
  } else {
    return <RHFField type="text" {...inputProps} />;
  }
}

function ValuesBasedTableFilterComponent(props: TableFilterComponentProps) {
  const { name } = props;
  const project = React.useContext(ProjectContext);
  const column = useProjectColumnField(name ? `${name}.target` : 'target');

  const inputProps = {
    label: 'Values',
    required: true,
    name: name ? `${name}.values` : 'values',
  };

  if (!column) return;
  if (
    column.type === SchemaColumnTypeEnum.Categorical ||
    column.type === SchemaColumnTypeEnum.OrderedCategorical
  ) {
    // NOTE: Topic should have a separate TopicSelect component
    return (
      <TableUniqueValuesMultiSelectField
        column={column.name}
        projectId={project.id}
        {...inputProps}
      />
    );
  } else if (column.type === SchemaColumnTypeEnum.Topic) {
    return (
      <TopicFilterMultiSelectField
        column={column}
        {...inputProps}
        withOutlier
      />
    );
  } else {
    return <RHFField type="tags" {...inputProps} />;
  }
}

export default function TableFilterComponent(props: TableFilterComponentProps) {
  const { name, onDelete } = props;
  const type = useWatch({
    name: name ? `${name}.type` : 'type',
  }) as TableFilterTypeEnum;

  let children: React.ReactNode = undefined;
  switch (type) {
    case TableFilterTypeEnum.And:
    case TableFilterTypeEnum.Or: {
      children = (
        <CompoundTableFilterComponent
          name={name}
          renderer={TableFilterComponent}
        />
      );
      break;
    }
    case TableFilterTypeEnum.Not: {
      children = (
        <TableFilterComponent name={name ? `${name}.operand` : 'operand'} />
      );
      break;
    }
    case TableFilterTypeEnum.EqualTo:
    case TableFilterTypeEnum.GreaterThan:
    case TableFilterTypeEnum.GreaterThanOrEqualTo:
    case TableFilterTypeEnum.LessThan:
    case TableFilterTypeEnum.LessThanOrEqualTo: {
      children = <ValueBasedTableFilterComponent name={props.name} />;
      break;
    }
    case TableFilterTypeEnum.HasText: {
      children = (
        <RHFField
          name={name ? `${name}.value` : 'value'}
          type="text"
          label="Text"
          description="Any sub-text that could've been contained in the values of this column."
        />
      );
      break;
    }
    case TableFilterTypeEnum.IsOneOf:
    case TableFilterTypeEnum.Includes:
    case TableFilterTypeEnum.Excludes:
    case TableFilterTypeEnum.Only: {
      children = <ValuesBasedTableFilterComponent name={name} />;
      break;
    }
    case TableFilterTypeEnum.Empty:
    case TableFilterTypeEnum.NotEmpty: {
      children = undefined;
      break;
    }
  }

  return (
    <TableFilterScaffold name={name} onDelete={onDelete}>
      {children}
    </TableFilterScaffold>
  );
}
