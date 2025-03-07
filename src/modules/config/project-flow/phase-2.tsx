// +---------------+
// | CHECK DATASET |

import {
  ProjectCheckDatasetModel,
  useCheckProjectDataset,
} from '@/api/project';
import Colors from '@/common/constants/colors';
import { DataSourceTypeEnum } from '@/common/constants/enum';
import { formSetErrors } from '@/common/utils/form';
import {
  Flex,
  Stack,
  Title,
  Alert,
  LoadingOverlay,
  Button,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { WarningCircle, ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  ProjectConfigFormType,
  DefaultProjectSchemaColumnValues,
} from '../form-type';
import Text from '@/components/standard/text';
import RHFField from '@/components/standard/fields';
import GlobalConfig from '@/common/constants/global';

// +---------------+
interface ProjectConfigDataSourceFormProps {
  disabled: boolean;
}

function ProjectConfigDataSourceFormFieldSwitcher(
  props: ProjectConfigDataSourceFormProps,
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
        w="100%"
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
        readOnly={props.disabled}
        required
      />
    );
  }
  return null;
}

export function ConfigureDataSourceForm(
  props: ProjectConfigDataSourceFormProps,
) {
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
          readOnly={props.disabled}
          w="100%"
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
          readOnly={props.disabled}
          w="100%"
        />
      </Flex>
      <ProjectConfigDataSourceFormFieldSwitcher {...props} />
    </>
  );
}

interface ConfigureProjectFlow_CheckDatasetProps {
  onContinue(values: ProjectCheckDatasetModel): void;
  onBack(): void;
  hasData: boolean;
}

export function ConfigureProjectFlow_CheckDataset(
  props: ConfigureProjectFlow_CheckDatasetProps,
) {
  const { mutateAsync: check, isPending } = useCheckProjectDataset();
  const { getValues, setError, setValue } =
    useFormContext<ProjectConfigFormType>();
  const handleSubmit = async () => {
    const values = getValues();
    try {
      const res = await check(values.source);
      if (res.message) {
        showNotification({
          message: res.message,
          color: 'green',
        });
      }

      setValue(
        'columns',
        res.data.columns.map((column) => {
          return DefaultProjectSchemaColumnValues(column.name, column.type);
        }),
      );
      props.onContinue(res.data);
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

  return (
    <Stack className="relative">
      <Title order={2}>2/3: Where&apos;s the location of your dataset?</Title>
      <Text>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Text>
      {props.hasData && (
        <Alert color="yellow">
          <Flex align="center" gap={16} py={8}>
            <WarningCircle size={24} />
            Note that once your dataset has been changed, any existing columns
            will need to be re-configured. Furthermore, any cached objects like
            document vectors and topic modeling results will have to be deleted.
            This means that you will have to run the topic modeling procedure
            again if you have already run it before.
          </Flex>
        </Alert>
      )}
      <LoadingOverlay visible={isPending} />
      <ConfigureDataSourceForm disabled={false} />
      <Flex justify="space-between" direction="row-reverse" w="100%">
        <Button
          leftSection={<CheckCircle size={20} />}
          onClick={handleSubmit}
          loading={isPending}
        >
          Verify Dataset
        </Button>
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
