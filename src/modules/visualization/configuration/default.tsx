import { ProjectContext } from '@/modules/project/context';
import { ProjectColumnSelectField } from '@/modules/project/select-column-input';
import { Alert, Group, Stack } from '@mantine/core';
import React from 'react';
import { useAllowedDashboardItemTypes } from '../types/dashboard-item-types';
import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';
import { fromPairs } from 'lodash-es';
import { useFormContext, useWatch } from 'react-hook-form';
import { VisualizationConfigFormType } from './form-type';
import { Info } from '@phosphor-icons/react';
import { SchemaColumnModel } from '@/api/project';
import { useContextSelector } from 'use-context-selector';
import { DashboardConstraintContext } from '../types/context';

function ColumnDashboardItemSelectInput() {
  const project = React.useContext(ProjectContext);
  const { control, setValue } = useFormContext<VisualizationConfigFormType>();
  const chosenColumnName = useWatch({
    name: 'column',
    control,
  });
  const column = project.config.data_schema.columns.find((col) => {
    return col.name === chosenColumnName;
  });

  const getAllowedTypes = useAllowedDashboardItemTypes();

  const supportedTypes = React.useMemo(() => {
    if (!column) return [];
    return getAllowedTypes(column);
  }, [column, getAllowedTypes]);

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
      key={column?.name}
      disabled={!column}
      description="The type of the visualization you want to use for this dashboard item."
      className="flex-1"
      onChange={() => {
        setValue('config', {});
      }}
    />
  );
}

function DashboardItemTypeDescription() {
  const { control } = useFormContext<VisualizationConfigFormType>();
  const dashboardType = useWatch({
    control,
    name: 'type',
  });
  const dashboardConfig = DASHBOARD_ITEM_CONFIGURATION[dashboardType];
  if (!dashboardConfig) return null;
  return (
    <Alert title={dashboardConfig.label} color="blue" icon={<Info />}>
      {dashboardConfig.description}
    </Alert>
  );
}

export function DefaultVisualizationConfigurationForm() {
  const controlledColumns = useContextSelector(
    DashboardConstraintContext,
    (store) => store.columns,
  );

  const project = React.useContext(ProjectContext);
  const { reset, setValue } = useFormContext<VisualizationConfigFormType>();
  const getAllowedTypes = useAllowedDashboardItemTypes();
  const columns = React.useMemo(() => {
    if (controlledColumns) {
      return controlledColumns;
    }
    return project.config.data_schema.columns.filter((column) => {
      return getAllowedTypes(column).length > 0;
    });
  }, [controlledColumns, getAllowedTypes, project.config.data_schema.columns]);

  return (
    <Stack>
      <Group align="start">
        <ProjectColumnSelectField
          data={columns}
          name="column"
          label="Column"
          required
          allowDeselect={false}
          className="flex-1"
          description="The column that contains the data to be visualized."
          onChange={(column) => {
            reset();
            setValue('column', column?.name ?? '');
          }}
        />
        <ColumnDashboardItemSelectInput />
      </Group>
      <DashboardItemTypeDescription />
      <RHFField
        name="description"
        label="Description"
        type="textarea"
        className="max-w-3/4"
      />
    </Stack>
  );
}
