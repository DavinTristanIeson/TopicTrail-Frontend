import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Group, Stack } from '@mantine/core';
import React from 'react';
import {
  ALLOWED_DASHBOARD_ITEM_COLUMNS,
  SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN,
} from '../types/dashboard-item-types';
import { SchemaColumnModel } from '@/api/project';
import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';
import { fromPairs } from 'lodash';

interface ColumnDashboardItemSelectInputProps {
  column: SchemaColumnModel | null;
}

function ColumnDashboardItemSelectInput(
  props: ColumnDashboardItemSelectInputProps,
) {
  const { column } = props;
  const supportedTypes = column
    ? SUPPORTED_DASHBOARD_ITEM_TYPES_PER_COLUMN[
        column.type as SchemaColumnTypeEnum
      ]
    : undefined;

  const selectData =
    supportedTypes
      ?.map((type) => {
        const config = DASHBOARD_ITEM_CONFIGURATION[type];
        if (!config) {
          return null!;
        }
        return {
          label: config.label,
          value: type,
        };
      })
      .filter(Boolean) ?? [];

  const dictionary = React.useMemo(() => {
    if (!supportedTypes) {
      return {};
    }
    const dictionaryEntries = supportedTypes
      .map((type) => {
        const config = DASHBOARD_ITEM_CONFIGURATION[type];
        if (!config) {
          return null!;
        }
        const entry = {
          value: type,
          label: config.label,
          description: config.description,
        };
        return [type, entry];
      })
      .filter(Boolean);
    return fromPairs(dictionaryEntries);
  }, [supportedTypes]);
  const renderOption = useDescriptionBasedRenderOption(dictionary);

  return (
    <RHFField
      name="type"
      type="select"
      data={selectData}
      renderOption={renderOption}
      label="Type"
      required
      description="The type of the visualization you want to use for this dashboard item."
      className="flex-1"
    />
  );
}

export function DefaultVisualizationConfigurationForm() {
  const project = React.useContext(ProjectContext);
  const columns = project.config.data_schema.columns.filter((column) => {
    return ALLOWED_DASHBOARD_ITEM_COLUMNS.includes(
      column.type as SchemaColumnTypeEnum,
    );
  });
  const [column, setColumn] = React.useState<SchemaColumnModel | null>(null);
  return (
    <Stack>
      <Group align="start">
        <ProjectColumnSelectField
          data={columns}
          name="column"
          label="Column"
          required
          allowDeselect={false}
          onChange={setColumn}
          className="flex-1"
          description="The column that contains the data to be visualized."
        />
        {column != null && <ColumnDashboardItemSelectInput column={column} />}
      </Group>
      <RHFField
        name="description"
        label="Description"
        type="textarea"
        className="max-w-3/4"
      />
    </Stack>
  );
}
