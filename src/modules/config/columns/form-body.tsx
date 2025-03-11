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

interface ProjectConfigColumnFormItemProps {
  index: number;
  accordionValue: string;
  opened: boolean;
}

function ProjectConfigColumnFormSwitcher(
  props: ProjectConfigColumnFormItemProps,
) {
  const { index } = props;
  let component: React.ReactNode = undefined;
  const { control } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: `columns.${props.index}.type`,
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

function ProjectConfigColumnTitle(props: ProjectConfigColumnFormItemProps) {
  const { index } = props;
  const { control } = useFormContext<ProjectConfigFormType>();

  const parentName = `columns.${index}` as const;
  const [name, type] = useWatch({
    name: [`${parentName}.name`, `${parentName}.type`],
    control,
  });
  const error = useWatchFieldError(parentName);
  return (
    <Group>
      {error && (
        <Tooltip label={error} radius="sm" color="red">
          <Warning color="red" />
        </Tooltip>
      )}
      <ProjectSchemaTypeIcon type={type} />
      <Text fw="bold" size="md">
        {name}
      </Text>
    </Group>
  );
}

export function ProjectConfigColumnFormItem(
  props: ProjectConfigColumnFormItemProps,
) {
  const { index, accordionValue, opened } = props;
  const parentName = `columns.${index}`;
  return (
    <Accordion.Item value={accordionValue}>
      <Accordion.Control>
        <ProjectConfigColumnTitle {...props} />
      </Accordion.Control>
      <Accordion.Panel>
        {opened && (
          <Stack>
            <Group align="center">
              <RHFMantineAdapter
                props={{
                  name: `${parentName}.type`,
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
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
