import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import {
  Alert,
  Button,
  Divider,
  LoadingOverlay,
  Modal,
  Stack,
  Title,
} from '@mantine/core';
import React from 'react';
import StatisticTestForm from './form';
import StatisticTestResultRenderer from './result';
import { TestTube, Warning } from '@phosphor-icons/react';
import { ProjectContext } from '@/modules/project/context';
import { client } from '@/common/api/client';
import { StatisticTestFormType } from './form-type';
import { NamedFiltersContext } from '../context';

function StatisticTestModalBody() {
  const project = React.useContext(ProjectContext);
  const { filters } = React.useContext(NamedFiltersContext);
  const { data, error, isPending, mutateAsync } = client.useMutation(
    'post',
    '/table/{project_id}/statistic-test',
  );
  const onSubmit = React.useCallback(
    async (values: StatisticTestFormType) => {
      await mutateAsync({
        body: {
          ...values,
          group1: filters.find((filter) => values.group1 === filter.name)!,
          group2: filters.find((filter) => values.group2 === filter.name)!,
        },
        params: {
          path: {
            project_id: project.id,
          },
        },
      });
    },
    [filters, mutateAsync, project.id],
  );
  return (
    <Stack className="relative">
      <LoadingOverlay visible={isPending} />
      {error && (
        <Alert
          title="An error occurred while running the statistic test!"
          color="red"
          icon={<Warning size={20} />}
        >
          {error.message}
        </Alert>
      )}
      <StatisticTestForm onSubmit={onSubmit} />
      {data && !isPending && !error && (
        <>
          <Divider />
          <Title order={3}>Result</Title>
          <StatisticTestResultRenderer {...data.data} />
        </>
      )}
    </Stack>
  );
}

const StatisticTestModal = React.forwardRef<DisclosureTrigger | null, object>(
  function StatisticTestModal(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    return (
      <Modal opened={opened} onClose={close} title="Statistic Test" size={1200}>
        {opened && <StatisticTestModalBody />}
      </Modal>
    );
  },
);

export default StatisticTestModal;

export function OpenStatisticTestModalButton() {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <Button
        onClick={() => {
          remote.current?.open();
        }}
        leftSection={<TestTube />}
      >
        Statistic Test
      </Button>
      <StatisticTestModal ref={remote} />
    </>
  );
}
