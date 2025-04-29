import React from 'react';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DefaultErrorViewBoundary } from '../visual/error';

interface AppLayoutProps {
  Sidebar?: React.ReactNode;
  Header: React.ReactNode;
  children?: React.ReactNode;
}

export default function AppLayout(props: AppLayoutProps) {
  const { Sidebar, Header, children } = props;

  const [opened, { toggle }] = useDisclosure(true);

  return (
    <AppShell
      header={{
        height: 60,
      }}
      navbar={
        Sidebar
          ? {
              width: 240,
              breakpoint: 'sm',
              collapsed: {
                mobile: !opened,
                desktop: !opened,
              },
            }
          : undefined
      }
      layout="default"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          {Sidebar && <Burger opened={opened} onClick={toggle} size="sm" />}
          {Header}
        </Group>
      </AppShell.Header>
      {Sidebar && (
        <AppShell.Navbar>
          <div className="h-full p-2">{Sidebar}</div>
        </AppShell.Navbar>
      )}
      <AppShell.Main>
        <div className="relative" style={{ height: `calc(100dvh - 60px)` }}>
          <DefaultErrorViewBoundary>{children}</DefaultErrorViewBoundary>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
