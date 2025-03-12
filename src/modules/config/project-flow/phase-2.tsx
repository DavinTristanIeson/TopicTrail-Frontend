// +---------------+
// | CHECK DATASET |

import {
  DataSourceTypeEnum,
  SchemaColumnTypeEnum,
} from '@/common/constants/enum';
import { formSetErrors } from '@/common/utils/form';
import {
  Flex,
  Stack,
  Title,
  LoadingOverlay,
  Button,
  Modal,
  Alert,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  LockOpen,
  Warning,
  X,
} from '@phosphor-icons/react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  ProjectConfigFormType,
  DefaultProjectSchemaColumnValues,
  ProjectConfigColumnFormType,
} from '../form-type';
import Text from '@/components/standard/text';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';
import { client } from '@/common/api/client';
import { transformDataSourceFormType2DataSourceInput } from '../columns/utils';
import { ProjectInferDatasetModel } from '@/api/project';
import fromPairs from 'lodash/fromPairs';
import React from 'react';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';

interface ConfigureDataSourceFormProps {
  disabled?: boolean;
}

function ProjectConfigDataSourceFormFieldSwitcher(
  props: ConfigureDataSourceFormProps,
) {
  const { control } = useFormContext<ProjectConfigFormType>();
  const type = useWatch({
    name: 'source.type',
    control,
  });

  if (type === DataSourceTypeEnum.CSV) {
    return (
      <RHFField
        type="text"
        name="source.delimiter"
        label="Delimiter"
        placeholder=","
        description="The delimiter used to separate the columns in a CSV file. It's usually , or ;."
        required
        w="49%"
        disabled={props.disabled}
      />
    );
  }
  if (type === DataSourceTypeEnum.Excel) {
    return (
      <RHFField
        type="text"
        name="source.sheetName"
        label="Sheet Name"
        description="The sheet that contains the data to be analyzed."
        required
        w="49%"
        disabled={props.disabled}
      />
    );
  }
  return null;
}

export function ConfigureDataSourceForm(props: ConfigureDataSourceFormProps) {
  return (
    <>
      <Flex gap={24}>
        <RHFField
          type="text"
          name="source.path"
          label="Dataset Path"
          placeholder="path/to/dataset"
          description={`Enter the absolute file path or relative file path (relative to the directory of the ${GlobalConfig.AppName}) to your dataset.`}
          required
          w="100%"
          disabled={props.disabled}
        />
        <RHFField
          type="select"
          name="source.type"
          data={[
            {
              label: 'CSV',
              value: DataSourceTypeEnum.CSV,
            },
            {
              label: 'Excel',
              value: DataSourceTypeEnum.Excel,
            },
            {
              label: 'Parquet',
              value: DataSourceTypeEnum.Parquet,
            },
          ]}
          clearable={false}
          label="Dataset Type"
          description="We need to know the type of the dataset so that we can properly parse its contents."
          w="100%"
          disabled={props.disabled}
        />
      </Flex>
      <ProjectConfigDataSourceFormFieldSwitcher {...props} />
    </>
  );
}

function useConfigureDataSourceSubmitBehavior() {
  const { mutateAsync: check, isPending } = client.useMutation(
    'post',
    '/projects/check-dataset',
  );
  const { getValues, setError, setValue } =
    useFormContext<ProjectConfigFormType>();

  const onSubmit = async () => {
    const values = getValues();
    try {
      const res = await check({
        body: transformDataSourceFormType2DataSourceInput(values.source),
      });
      if (res.message) {
        showNotification({
          message: res.message,
          color: 'green',
        });
      }

      const previous = fromPairs(
        getValues('columns').map((col) => [
          col.name,
          col as ProjectConfigColumnFormType,
        ]),
      );

      setValue(
        'columns',
        res.data.columns.map((column) => {
          if (previous[column.name]) {
            return previous[column.name]!;
          } else {
            return DefaultProjectSchemaColumnValues(
              column.name,
              column.type as SchemaColumnTypeEnum,
            );
          }
        }),
      );
    } catch (e: any) {
      console.error(e);
      if (e.message) {
        showNotification({
          color: 'red',
          message: e.message,
        });
      }
      if (e.errors) {
        formSetErrors(e.errors, (name, error) =>
          setError(`source.${name}` as any, error),
        );
      }
    }
  };
  return { onSubmit, isPending };
}

const ConfigureProjectFlowUpdateModal = React.forwardRef<
  DisclosureTrigger | null,
  object
>(function ConfigureProjectFlowUpdateModal(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const { onSubmit, isPending } = useConfigureDataSourceSubmitBehavior();
  return (
    <Modal title="Change Dataset" size="lg" opened={opened} onClose={close}>
      <LoadingOverlay visible={isPending} />
      <Stack>
        <ConfigureDataSourceForm />
        <Flex justify="space-between" direction="row-reverse" w="100%">
          <Button
            leftSection={<CheckCircle size={20} />}
            onClick={onSubmit}
            loading={isPending}
          >
            Verify Dataset
          </Button>
          <Button
            leftSection={<X size={20} />}
            variant="outline"
            color="red"
            onClick={close}
          >
            Cancel
          </Button>
        </Flex>
      </Stack>
    </Modal>
  );
});

interface ConfigureProjectFlow_CheckDatasetProps {
  onContinue(): void;
  onBack(): void;
  hasData?: boolean;
}

export function ConfigureProjectFlow_CheckDataset(
  props: ConfigureProjectFlow_CheckDatasetProps,
) {
  const { isPending, onSubmit } = useConfigureDataSourceSubmitBehavior();
  const updateModalRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <Stack className="relative">
      {props.hasData && (
        <ConfigureProjectFlowUpdateModal ref={updateModalRemote} />
      )}
      <Title order={2}>2/3: Where&apos;s the location of your dataset?</Title>
      <Text>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Text>
      <LoadingOverlay visible={isPending} />
      {props.hasData && (
        <Alert color="red" icon={<Warning size={20} />}>
          <Stack>
            <Text inherit>
              To prevent data corruption, we will not allow you to edit the
              dataset fields without verifying the dataset. If you want to edit
              the dataset, please press the "Change Dataset" button. Note that
              if the new dataset has different columns compared to the current
              dataset, your pre-existing column configurations will be deleted.
            </Text>
            <Button
              leftSection={<LockOpen size={20} />}
              variant="outline"
              color="red"
              onClick={() => updateModalRemote.current?.open()}
            >
              Change Dataset
            </Button>
          </Stack>
        </Alert>
      )}
      <ConfigureDataSourceForm disabled />
      <Flex justify="space-between" direction="row-reverse" w="100%">
        {props.hasData ? (
          <Button
            rightSection={<ArrowRight size={20} />}
            onClick={props.onContinue}
          >
            Next
          </Button>
        ) : (
          <Button
            leftSection={<CheckCircle size={20} />}
            onClick={async () => {
              await onSubmit();
              props.onContinue();
            }}
            loading={isPending}
          >
            Verify Dataset
          </Button>
        )}
        {props.onBack && (
          <Button
            leftSection={<ArrowLeft size={20} />}
            variant="outline"
            onClick={props.onBack}
          >
            Change Project Name?
          </Button>
        )}
      </Flex>
    </Stack>
  );
}
