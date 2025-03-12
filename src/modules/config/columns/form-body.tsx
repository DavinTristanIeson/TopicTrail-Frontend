import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { Accordion, Divider, Group, Stack, Tooltip } from '@mantine/core';
import React from 'react';
import Text from '@/components/standard/text';
import { Warning } from '@phosphor-icons/react';
import { useWatchFieldError } from '@/components/standard/fields/watcher';
import Colors from '@/common/constants/colors';
import { RHFMantineAdapter } from '@/components/standard/fields/adapter';
import { ProjectColumnTypeSelectInput } from '@/modules/project/select-column-input';
import RHFField from '@/components/standard/fields';
import { ProjectSchemaTypeIcon } from '@/components/widgets/project-schema-icon';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';
import { ProjectConfigColumnContinuousForm } from './continuous-column';
import { ProjectConfigColumnOrderedCategoricalForm } from './ordered-categorical-column';
import {
  ProjectConfigColumnGeospatialForm,
  ProjectConfigColumnMulticategoricalForm,
  ProjectConfigColumnTemporalForm,
} from './other-columns';
import { ProjectConfigColumnTextualForm } from './textual-column';
import { SelectFieldProps } from '@/components/standard/fields/wrapper';

interface ProjectConfigColumnFormItemProps {
  index: number;
}

function ProjectConfigColumnFormSwitcher(
  props: ProjectConfigColumnFormItemProps,
) {
  const { index } = props;
  let component: React.ReactNode = undefined;
  const { control, getValues } = useFormContext<ProjectConfigFormType>();
  const name = `columns.${props.index}.type` as const;
  const type = useWatch({
    name,
    control,
  });
  switch (type) {
    case SchemaColumnTypeEnum.Continuous: {
      component = <ProjectConfigColumnContinuousForm index={index} />;
      break;
    }
    case SchemaColumnTypeEnum.OrderedCategorical: {
      component = <ProjectConfigColumnOrderedCategoricalForm index={index} />;
      break;
    }
    case SchemaColumnTypeEnum.Geospatial: {
      component = <ProjectConfigColumnGeospatialForm index={index} />;
      break;
    }
    case SchemaColumnTypeEnum.MultiCategorical: {
      component = <ProjectConfigColumnMulticategoricalForm index={index} />;
      break;
    }
    case SchemaColumnTypeEnum.Temporal: {
      component = <ProjectConfigColumnTemporalForm index={index} />;
      break;
    }
    case SchemaColumnTypeEnum.Textual: {
      component = <ProjectConfigColumnTextualForm index={index} />;
      break;
    }
    default: {
      component = undefined;
      break;
    }
  }
  if (component) {
    return (
      <>
        <Divider />
        {component}
      </>
    );
  } else {
    return component;
  }
}

export function ProjectConfigColumnFormItem(
  props: ProjectConfigColumnFormItemProps,
) {
  const { index } = props;
  const parentName = `columns.${index}`;
  return (
    <Stack className="pt-5">
      <Group align="center">
        <RHFMantineAdapter<SelectFieldProps>
          props={{
            name: `${parentName}.type`,
            type: 'select',
            className: 'flex-1',
          }}
          config={{
            extractEventValue(e) {
              return e;
            },
          }}
        >
          {ProjectColumnTypeSelectInput}
        </RHFMantineAdapter>
        <RHFField
          name={`${parentName}.alias`}
          label="Alias"
          type="text"
          description="The alias of the column that will be displayed in tables/graphs. Leave it blank if you don't want any aliases."
          required
          className="flex-1"
        />
      </Group>
      <ProjectConfigColumnFormSwitcher {...props} />
    </Stack>
  );
}
