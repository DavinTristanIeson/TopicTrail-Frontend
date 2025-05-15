import {
  SchemaColumnModel,
  filterProjectColumnsByType,
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
} from '@/api/project';
import { client } from '@/common/api/client';
import { handleError } from '@/common/utils/error';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import { Group, Button, Text } from '@mantine/core';
import React from 'react';
import { useComparisonAppState } from '../app-state';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { List } from '@phosphor-icons/react';

export function EnumerationSubdatasetSelectInput() {
  const project = React.useContext(ProjectContext);
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  const columns = filterProjectColumnsByType(
    project,
    CATEGORICAL_SCHEMA_COLUMN_TYPES,
  );

  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const { isPending, mutateAsync: enumerateUniqueValues } = client.useMutation(
    'post',
    '/table/{project_id}/column/unique',
  );
  const enumerateSubdatasets = React.useCallback(async () => {
    if (!column) return;
    try {
      const res = await enumerateUniqueValues({
        body: {
          column: column.name,
          filter: null,
        },
        params: {
          path: {
            project_id: project.id,
          },
        },
      });
      const uniqueValues = res.data.values;
      const uniqueSubdatasetNames: Map<string, number> = new Map();
      setComparisonGroups(
        uniqueValues.map((value) => {
          let label = String(value);
          if (uniqueSubdatasetNames.has(label)) {
            const newName = uniqueSubdatasetNames.get(label)! + 1;
            label = `${label} (${newName})`;
          } else {
            uniqueSubdatasetNames.set(label, 1);
          }
          return {
            name: label,
            visible: true,
            filter: {
              type: 'and',
              operands: [
                {
                  type: 'equal_to',
                  target: column.name,
                  value: value as string | number,
                },
              ],
            },
          };
        }),
      );
    } catch (e) {
      handleError(e);
    }
  }, [column, enumerateUniqueValues, project.id, setComparisonGroups]);

  return (
    <>
      <Text size="sm" c="gray">
        Enumerate the values of a column as subdatasets. This is useful if you
        want to create subdatasets for every unique category in a categorical
        column.
      </Text>
      <ProjectColumnSelectInput
        value={column?.name ?? null}
        onChange={setColumn}
        data={columns}
        disabled={isPending}
        styles={{
          input: {
            minWidth: 512,
          },
        }}
        inputContainer={(children) => (
          <Group className="w-full">
            {children}
            <Button
              onClick={enumerateSubdatasets}
              loading={isPending}
              disabled={!column}
            >
              Apply
            </Button>
          </Group>
        )}
      />
    </>
  );
}

export function EnumerationSubdatasetsBooleanColumns() {
  const project = React.useContext(ProjectContext);
  const booleanColumns = filterProjectColumnsByType(project, [
    SchemaColumnTypeEnum.Boolean,
  ]);

  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const enumerateSubdatasets = React.useCallback(async () => {
    try {
      setComparisonGroups(
        booleanColumns.map((column) => {
          return {
            name: column.name,
            visible: true,
            filter: {
              type: 'and',
              operands: [
                {
                  type: 'is_true',
                  target: column.name,
                },
              ],
            },
          };
        }),
      );
    } catch (e) {
      handleError(e);
    }
  }, [booleanColumns, setComparisonGroups]);
  if (booleanColumns.length <= 1) {
    return null;
  }
  return (
    <>
      <Text size="sm" c="gray">
        Alternatively, you can enumerate the columns with boolean data types as
        your subdatasets. Each boolean column will be used to create a
        subdataset that only consists of rows where that boolean column contains
        a positive value.
      </Text>
      <Button
        onClick={enumerateSubdatasets}
        leftSection={<List />}
        className="max-w-sm"
      >
        Enumerate Boolean Columns
      </Button>
    </>
  );
}
