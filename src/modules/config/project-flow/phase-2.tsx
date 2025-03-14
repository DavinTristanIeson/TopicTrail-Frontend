// +---------------+
// | CHECK DATASET |

import {
  Flex,
  Stack,
  Title,
  LoadingOverlay,
  Button,
  Alert,
  Text,
} from '@mantine/core';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  LockOpen,
  Warning,
} from '@phosphor-icons/react';
import React from 'react';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { FormEditableContext } from '@/components/standard/fields/context';
import { ProjectConfigDataSourceUpdateModal } from '../data-source/update-modal';
import { useVerifyFormDataSource } from '../data-source/check';
import { ProjectConfigDataSourceFormBody } from '../data-source/form-body';

interface ConfigureProjectFlow_CheckDatasetProps {
  onContinue(): void;
  onBack(): void;
  hasData?: boolean;
}

export function ConfigureProjectFlow_CheckDataset(
  props: ConfigureProjectFlow_CheckDatasetProps,
) {
  const { hasData, onBack, onContinue } = props;
  const { isPending, onSubmit } = useVerifyFormDataSource();
  const updateModalRemote = React.useRef<DisclosureTrigger | null>(null);
  const { editable } = React.useContext(FormEditableContext);
  const canUpdateDataset = !!hasData && editable;
  return (
    <Stack className="relative">
      {canUpdateDataset && (
        <ProjectConfigDataSourceUpdateModal ref={updateModalRemote} />
      )}
      <Title order={2}>2/3: Where&apos;s the location of your dataset?</Title>
      <Text>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Text>
      <LoadingOverlay visible={isPending} />
      {canUpdateDataset && (
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
              leftSection={<LockOpen />}
              variant="outline"
              color="red"
              onClick={() => updateModalRemote.current?.open()}
            >
              Change Dataset
            </Button>
          </Stack>
        </Alert>
      )}
      <ProjectConfigDataSourceFormBody disabled={canUpdateDataset} />
      <Flex justify="space-between" direction="row-reverse" w="100%">
        {hasData ? (
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
              onContinue();
            }}
            loading={isPending}
          >
            Verify Dataset
          </Button>
        )}
        {onBack && (
          <Button
            leftSection={<ArrowLeft size={20} />}
            variant="outline"
            onClick={onBack}
          >
            Change Project Name?
          </Button>
        )}
      </Flex>
    </Stack>
  );
}
