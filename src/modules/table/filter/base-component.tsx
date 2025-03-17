import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { ActionIcon, Button, Group, Paper, Stack, Switch } from '@mantine/core';
import { Plus, TrashSimple } from '@phosphor-icons/react';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
  COMPOUND_FILTER_TYPES,
  CompoundTableFilterTypeSelectField,
  TableFilterTypeSelectField,
} from './select-filter-type';
import { TableFilterTypeEnum } from '@/common/constants/enum';

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
  const { setValue, clearErrors } = useFormContext();
  const targetName = name ? `${name}.target` : 'target';
  const typeName = name ? `${name}.type` : 'type';

  const type = useWatch({ name: typeName }) as TableFilterTypeEnum;
  const target = useWatch({ name: targetName }) as string;

  if (!project) return null;
  return (
    <Paper className="p-2">
      <Stack>
        {onDelete && (
          <Group justify="end">
            <ActionIcon
              size={32}
              color="red"
              variant="subtle"
              onClick={onDelete}
            >
              <TrashSimple size={24} />
            </ActionIcon>
          </Group>
        )}
        {COMPOUND_FILTER_TYPES.includes(type) ? null : (
          <ProjectColumnSelectField
            name={targetName}
            data={project.config.data_schema.columns}
            label="Target"
            required
            onChange={() => {
              setValue(typeName, '', {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            allowDeselect
            clearable
          />
        )}
        {COMPOUND_FILTER_TYPES.includes(type) || !target ? (
          <CompoundTableFilterTypeSelectField
            name={typeName}
            label="Type"
            required
            // RERENDER DAMMIT
            key={`${type}-${target}`}
            onChange={(e) => {
              setValue(
                name,
                { target, type: e },
                { shouldTouch: true, shouldDirty: true },
              );
              clearErrors(name);
            }}
          />
        ) : (
          <TableFilterTypeSelectField
            name={typeName}
            targetName={targetName}
            label="Type"
            // RERENDER DAMMIT
            key={`${type}-${target}`}
            required
            onChange={(e) => {
              setValue(
                name,
                { target, type: e },
                { shouldTouch: true, shouldDirty: true },
              );
              clearErrors(name);
            }}
          />
        )}
        {props.children}
      </Stack>
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
  const { fields, remove, append } = useFieldArray({
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
      <Button
        fullWidth
        leftSection={<Plus />}
        onClick={() => {
          append({
            type: '',
            target: '',
          });
        }}
      >
        Add Operand
      </Button>
    </>
  );
}
