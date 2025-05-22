import {
  SchemaColumnModel,
  filterProjectColumnsByType,
  CATEGORICAL_SCHEMA_COLUMN_TYPES,
} from '@/api/project';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectInput } from '@/modules/project/select-column-input';
import { Button, Text, Fieldset, Stack, Card } from '@mantine/core';
import React from 'react';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import EnumerateTopicValuesActions from './topic';
import EnumerateCategoricalValuesActions from './categorical';
import EnumerationSubdatasetsBooleanColumns from './boolean';
import { List } from '@phosphor-icons/react';

export function EnumerationSubdatasetSelectInput() {
  const project = React.useContext(ProjectContext);
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  const columns = filterProjectColumnsByType(
    project,
    CATEGORICAL_SCHEMA_COLUMN_TYPES,
  );

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
        styles={{
          input: {
            minWidth: 512,
          },
        }}
      />
      {column &&
        (column.type === SchemaColumnTypeEnum.Topic ? (
          <EnumerateTopicValuesActions column={column} />
        ) : (
          <EnumerateCategoricalValuesActions column={column} />
        ))}
      {!column && (
        <Button disabled className="max-w-sm" leftSection={<List />}>
          Enumerate Values
        </Button>
      )}
    </>
  );
}

export function EnumerationSubdatasets() {
  return (
    <Card>
      <Fieldset legend="Enumeration" className="w-full">
        <Stack>
          <EnumerationSubdatasetSelectInput />
          <EnumerationSubdatasetsBooleanColumns />
        </Stack>
      </Fieldset>
    </Card>
  );
}
