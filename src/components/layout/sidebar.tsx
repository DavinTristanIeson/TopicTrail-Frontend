import { handleErrorFn } from '@/common/utils/error';
import Colors from '@/common/constants/colors';
import { useRouter } from 'next/router';
import React from 'react';
import PromiseButton from '../standard/button/promise';
import { Url } from 'next/dist/shared/lib/router/router';
import { Divider, Group, NavLink, Stack } from '@mantine/core';
import NavigationRoutes from '@/common/constants/routes';

export interface AppNavigationLink {
  label: string;
  icon?: React.ReactNode;
  onClick?(): void;
  url?: {
    pathname: NavigationRoutes;
    query: Record<string, string[] | string>;
  };
  loading?: boolean;
  active?: boolean;
}
interface AppSidebarLinkRendererProps {
  links: AppNavigationLink[];
}

export function AppSidebarLinkRenderer({ links }: AppSidebarLinkRendererProps) {
  const router = useRouter();
  return (
    <Stack>
      {links?.map((link) => {
        return (
          <NavLink
            key={link.label}
            variant="light"
            color="brand"
            onClick={
              link.onClick
                ? handleErrorFn(link.onClick)
                : link.url
                  ? () => {
                      router.push(link.url!);
                    }
                  : undefined
            }
            leftSection={link.icon}
            disabled={link.loading}
            label={link.label}
            active={
              link.active ??
              (!!link.url && router.pathname === link.url.pathname)
            }
          />
        );
      })}
    </Stack>
  );
}
