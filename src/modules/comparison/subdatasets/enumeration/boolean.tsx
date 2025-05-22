import { ComparisonStateItemModel } from '@/api/comparison';
import { filterProjectColumnsByType, SchemaColumnModel } from '@/api/project';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { useMultiSelectSelectAllCheckbox } from '@/components/visual/select';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnMultiSelectInput } from '@/modules/project/select-column-input';
import { Button, Text } from '@mantine/core';
import { identity } from 'lodash-es';
import React from 'react';
import { useComparisonAppState } from '../../app-state';
import { List } from '@phosphor-icons/react';

export default function EnumerationSubdatasetsBooleanColumns() {
  const project = React.useContext(ProjectContext);
  const booleanColumns = filterProjectColumnsByType(project, [
    SchemaColumnTypeEnum.Boolean,
  ]);
  const [chosenColumns, setChosenColumns] = React.useState<SchemaColumnModel[]>(
    [],
  );

  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const enumerateSubdatasets = React.useCallback(async () => {
    const subdatasets = chosenColumns.map((column) => {
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
      } as ComparisonStateItemModel;
    });
    setComparisonGroups(subdatasets);
  }, [chosenColumns, setComparisonGroups]);

  const inputContainer = useMultiSelectSelectAllCheckbox({
    data: booleanColumns,
    value: chosenColumns,
    onChange: setChosenColumns,
    accessor: identity,
  });
  if (booleanColumns.length <= 1) {
    return null;
  }
  return (
    <>
      <Text size="sm" c="gray">
        Alternatively, you can enumerate the columns with boolean data types as
        your subdatasets. Each boolean column will be used to create a
        subdataset that only consists of rows where that boolean column contains
        a positive value. Beware that these subdatasets might not be mutually
        exclusive.
      </Text>
      <ProjectColumnMultiSelectInput
        data={booleanColumns}
        value={chosenColumns.map((column) => column.name)}
        onChange={setChosenColumns}
        className="w-full"
        inputContainer={inputContainer}
      />
      <Button
        onClick={enumerateSubdatasets}
        leftSection={<List />}
        className="max-w-sm"
        disabled={chosenColumns.length === 0}
      >
        Enumerate Boolean Columns
      </Button>
    </>
  );
}
