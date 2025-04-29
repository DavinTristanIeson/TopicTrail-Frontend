import { TableFilterModel } from '@/api/table';
import { ListSkeleton } from '@/components/visual/loading';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import React from 'react';
import ComparisonFilterDrawer from './drawer';
import { Button, Fieldset, Group, Stack, Text } from '@mantine/core';
import { Plus, Warning } from '@phosphor-icons/react';
import { defaultTableFilterFormValues } from '@/modules/filter/drawer/form-type';
import { ComparisonStateItemModel } from '@/api/comparison';
import { useComparisonStateDataManager } from '@/modules/userdata/data-manager';
import UserDataManager from '@/modules/userdata';
import { useComparisonAppState } from '../app-state';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import { ProjectContext } from '@/modules/project/context';
import {
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
  filterProjectColumnsByType,
  SchemaColumnModel,
} from '@/api/project';
import { client } from '@/common/api/client';
import { handleError } from '@/common/utils/error';

const SortableNamedTableFilterDndContext = dynamic(
  () => import('./sortable-filter-context'),
  {
    ssr: false,
    loading() {
      return <ListSkeleton count={3} />;
    },
  },
);

function EnumerationSubdatasetSelectInput() {
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
  );
}

function ComparisonStateDataManager() {
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );

  const rendererProps = useComparisonStateDataManager({
    onApply(state) {
      setComparisonGroups(state.groups);
    },
    state: React.useMemo(() => {
      if (!comparisonGroups || comparisonGroups.length === 0) {
        return null;
      }
      return {
        groups: comparisonGroups,
      };
    }, [comparisonGroups]),
  });

  return (
    <UserDataManager
      {...rendererProps}
      label="Subdatasets"
      Bottom={
        <Fieldset legend="Enumeration" className="w-full">
          <Stack>
            <Text size="sm" c="gray">
              Enumerate the values of a column as subdatasets. This is useful if
              you want to create subdatasets for every unique category in a
              categorical column.
            </Text>
            <EnumerationSubdatasetSelectInput />
          </Stack>
        </Fieldset>
      }
    />
  );
}

export default function NamedFiltersManager() {
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>(
      null,
    );
  const confirmationRemote = React.useRef<DisclosureTrigger | null>(null);
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const { setState: setComparisonGroups } = useComparisonAppState(
    (store) => store.groups.handlers,
  );
  return (
    <>
      <Stack>
        <ComparisonStateDataManager />
        <SortableNamedTableFilterDndContext editRemote={editRemote} />
        <Group justify="space-between">
          <Button
            leftSection={<Plus />}
            className="max-w-md"
            onClick={() => {
              editRemote.current?.open({
                name: `Subdataset ${comparisonGroups.length + 1}`,
                visible: true,
                filter: defaultTableFilterFormValues as TableFilterModel,
              });
            }}
          >
            Add New Subdataset
          </Button>
          <ConfirmationDialog
            dangerous
            title="Reset Subdatasets?"
            message='Are you sure you want to reset the subdatasets? If you want to reuse these subdatasets, you should save it first through the "Manage Subdatasets" menu at the top.'
            onConfirm={() => {
              setComparisonGroups([]);
            }}
            ref={confirmationRemote}
          />
          <Button
            color="red"
            leftSection={<Warning />}
            onClick={() => {
              confirmationRemote.current?.open();
            }}
            variant="outline"
          >
            Reset
          </Button>
        </Group>
      </Stack>
      <ComparisonFilterDrawer ref={editRemote} />
    </>
  );
}
