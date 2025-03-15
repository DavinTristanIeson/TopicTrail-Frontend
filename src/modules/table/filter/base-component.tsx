import { TableFilterModel } from '@/api/table';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { ActionIcon, Button, Group, Paper } from '@mantine/core';
import { Plus, TrashSimple } from '@phosphor-icons/react';
import React from 'react';
import { useFieldArray } from 'react-hook-form';

interface TableFilterScaffold {
  onDelete?(): void;
  children?: React.ReactNode;
}

export interface TableFilterComponentProps {
  parentName: string;
  onDelete?(): void;
}

export function TableFilterScaffold(props: TableFilterScaffold) {
  const { onDelete } = props;
  const project = React.useContext(ProjectContext);
  if (!project) return null;
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
        name="target"
        data={project.config.data_schema.columns}
        type="select"
      />
      {props.children}
    </Paper>
  );
}

interface CompoundTableFilterComponentProps extends TableFilterComponentProps {
  renderer(props: TableFilterComponentProps): React.ReactNode;
}

export function CompoundTableFilterComponent(
  props: CompoundTableFilterComponentProps,
) {
  const { onDelete, parentName, renderer: Renderer } = props;
  const { fields, remove } = useFieldArray({
    name: parentName,
  });
  return (
    <TableFilterScaffold onDelete={props.onDelete}>
      {fields.map((field, index) => (
        <Renderer
          parentName={`${parentName}.operands.${index}`}
          onDelete={() => remove(index)}
        />
      ))}
      <Button fullWidth leftSection={<Plus />}>
        Add Operand
      </Button>
    </TableFilterScaffold>
  );
}
