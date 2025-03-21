import { ComparisonStatisticTestInput } from '@/api/table';
import { client } from '@/common/api/client';
import { ProjectContext } from '@/modules/project/context';
import { Alert, Loader, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';

interface StatisticTestResultRendererProps {
  input: ComparisonStatisticTestInput | null;
}

export default function StatisticTestResultRenderer(
  props: StatisticTestResultRendererProps,
) {
  const { input } = props;
  const project = React.useContext(ProjectContext);
  const { data, error, isLoading } = client.useQuery(
    'post',
    '/table/{project_id}/statistic-test',
    {
      body: input as ComparisonStatisticTestInput,
      params: {
        path: {
          project_id: project.id,
        },
      },
    },
    {
      enabled: !!input,
    },
  );
  const warnings = data?.data.warnings;
  if (isLoading) {
    return <Loader size={48} type="dots" />;
  }
  if (error) {
    return (
      <Alert
        title="An error occurred while running the statistic test!"
        color="red"
        icon={<Warning size={20} />}
      >
        {error.message}
      </Alert>
    );
  }
  return (
    <>
      {warnings && warnings.length > 0 && (
        <Alert
          title={`There are ${warnings.length} warning(s) regarding the groups used in this statistic test`}
          color="yellow"
          icon={<Warning size={20} />}
        >
          {warnings.map((warning, index) => (
            <Text key={`${warning}-${index}`}>{warning}</Text>
          ))}
        </Alert>
      )}
    </>
  );
}
