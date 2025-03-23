import NavigationRoutes from '@/common/constants/routes';
import { Alert, Anchor, Text } from '@mantine/core';
import { Warning } from '@phosphor-icons/react';
import Link from 'next/link';
import React from 'react';
import { ProjectContext } from '@/modules/project/context';

export function NoTextualColumnWarning() {
  const project = React.useContext(ProjectContext);
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
      <Anchor
        component={Link}
        href={{
          pathname: NavigationRoutes.ProjectComparison,
          query: {
            id: project.id,
          },
        }}
        inherit
      >
        Table Page
      </Anchor>{' '}
      or{' '}
      <Anchor
        component={Link}
        href={{
          pathname: NavigationRoutes.ProjectComparison,
          query: {
            id: project.id,
          },
        }}
        inherit
      >
        Comparison Page
      </Anchor>{' '}
      instead.
    </Alert>
  );
}
