import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { ActionIcon, Button, Group, Paper } from '@mantine/core';
import { Plus, TrashSimple } from '@phosphor-icons/react';
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { TableFilterTypeSelectField } from './select-filter-type';

export interface TableFilterComponentProps {
  name: string;
  onDelete?(): void;
}

interface TableFilterScaffoldProps {
  name: string;
  onDelete: (() => void) | undefined;
  children?: React.ReactNode;
}

export function TableFilterScaffold(props: TableFilterScaffoldProps) {
  const { onDelete, name: name } = props;
  const project = React.useContext(ProjectContext);
  if (!project) return null;
  const targetName = name ? `${name}.target` : 'target';
  return (
    <Paper className="p-2">
      <Group justify="end">
        {onDelete && (
          <ActionIcon size={32} color="red" variant="subtle">
            <TrashSimple size={24} />
          </ActionIcon>
        )}
      </Group>
      <ProjectColumnSelectField
        name={targetName}
        data={project.config.data_schema.columns}
      />
      <TableFilterTypeSelectField
        name={name ? `${name}.type` : 'type'}
        targetName={targetName}
      />
      {props.children}
    </Paper>
  );
}

interface CompoundTableFilterComponentProps {
  name: string;
  renderer(props: TableFilterComponentProps): React.ReactNode;
}

export function CompoundTableFilterComponent(
  props: CompoundTableFilterComponentProps,
) {
  const { name, renderer: Renderer } = props;
  const parentName = name ? `${name}.operands` : 'operands';
  const { fields, remove } = useFieldArray({
    name: parentName,
  });
  return (
    <>
      {fields.map((field, index) => (
        <Renderer
          name={`${parentName}.${index}`}
          onDelete={() => remove(index)}
        />
      ))}
      <Button fullWidth leftSection={<Plus />}>
        Add Operand
      </Button>
    </>
  );
}
