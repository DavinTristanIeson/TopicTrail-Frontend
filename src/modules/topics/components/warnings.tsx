import NavigationRoutes from '@/common/constants/routes';
import { Alert, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import React from 'react';
import { ProjectPageLinks } from '@/components/utility/links';

export function NoTextualColumnWarning() {
  return (
    <Alert icon={<Warning />} color="yellow" title="There are no columns!">
      There are no textual columns in your dataset, which means that the{' '}
      <Text className="font-semibold" span inherit>
        Topics
      </Text>{' '}
      and{' '}
      <Text className="font-semibold" span inherit>
        Topic Correlation
      </Text>{' '}
      page will not be useful to you. Consider using the{' '}
      <ProjectPageLinks route={NavigationRoutes.ProjectComparison}>
        Table Page
      </ProjectPageLinks>{' '}
      or{' '}
      <ProjectPageLinks route={NavigationRoutes.ProjectComparison}>
        Comparison Page
      </ProjectPageLinks>{' '}
      instead.
    </Alert>
  );
}
