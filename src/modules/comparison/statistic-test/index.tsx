import { Alert, Divider, LoadingOverlay, Stack, Title } from '@mantine/core';
import React from 'react';
import StatisticTestForm from './form';
import StatisticTestResultRenderer from './result';
import { Warning } from '@phosphor-icons/react';
import { ProjectContext } from '@/modules/project/context';
import { client } from '@/common/api/client';
import { StatisticTestFormType } from './form-type';
import { useComparisonAppState } from '../app-state';

export default function ComparisonStatisticTest() {
  const project = React.useContext(ProjectContext);
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const { data, error, isPending, mutateAsync } = client.useMutation(
    'post',
    '/table/{project_id}/statistic-test',
  );
  const onSubmit = React.useCallback(
    async (values: StatisticTestFormType) => {
      await mutateAsync({
        body: {
          ...values,
          group1: comparisonGroups.find(
            (group) => values.group1 === group.name,
          )!,
          group2: comparisonGroups.find(
            (group) => values.group2 === group.name,
          )!,
        },
        params: {
          path: {
            project_id: project.id,
          },
        },
      });
    },
    [comparisonGroups, mutateAsync, project.id],
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
