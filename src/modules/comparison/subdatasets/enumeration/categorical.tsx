import { ComparisonStateItemModel } from '@/api/comparison';
import { SchemaColumnModel } from '@/api/project';
import { client } from '@/common/api/client';
import { handleError } from '@/common/utils/error';
import { ProjectContext } from '@/modules/project/context';
import { Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { zip } from 'lodash-es';
import { useComparisonAppState } from '../../app-state';
import { assignUniqueNames } from './utils';
import React from 'react';
import { List } from '@phosphor-icons/react';

interface EnumerateValuesActionsProps {
  column: SchemaColumnModel;
}

export default function EnumerateCategoricalValuesActions(
  props: EnumerateValuesActionsProps,
) {
  const { column } = props;
  const project = React.useContext(ProjectContext);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const setVisibility = useComparisonAppState(
    (store) => store.groups.setVisibility,
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
      const uniqueNames = assignUniqueNames(res.data.values);
      const subdatasets = zip(uniqueNames, res.data.values).map(
        ([label, value]) => {
          return {
            name: label!,
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
          } as ComparisonStateItemModel;
        },
      );
      setComparisonGroups(subdatasets);
      setVisibility(
        new Map(subdatasets.map((subdataset) => [subdataset.name, true])),
      );
      showNotification({
        message: `We have successfully created subdatasets based on the unique values of ${column.name}`,
        color: 'green',
      });
    } catch (e) {
      handleError(e);
    }
  }, [
    column,
    enumerateUniqueValues,
    project.id,
    setComparisonGroups,
    setVisibility,
  ]);
  return (
    <Button
      onClick={enumerateSubdatasets}
      loading={isPending}
      disabled={!column}
      className="max-w-sm"
      leftSection={<List />}
    >
      Enumerate Values of {column.name}
    </Button>
  );
}
