import NavigationRoutes from '@/common/constants/routes';
import { ProjectContext } from '@/modules/project/context';
import { Anchor } from '@mantine/core';
import Link from 'next/link';
import React from 'react';

interface ProjectPageLinksProps {
  route: NavigationRoutes;
  query?: Record<string, string>;
  children?: React.ReactNode;
}

export function ProjectPageLinks(props: ProjectPageLinksProps) {
  const project = React.useContext(ProjectContext);
  return (
    <Anchor
      inherit
      component={Link}
      href={{
        pathname: props.route,
        query: {
          id: project.id,
          ...props.query,
        },
      }}
    >
      {props.children}
    </Anchor>
  );
}
