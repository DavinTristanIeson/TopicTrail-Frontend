import { handleErrorFn } from "@/common/utils/error";
import Colors from "@/common/constants/colors";
import { useRouter } from "next/router";
import React from "react";
import PromiseButton from "../standard/button/promise";
import { Url } from "next/dist/shared/lib/router/router";
import { Divider, Group, Stack } from "@mantine/core";

export interface AppNavigationLink {
  label: string;
  icon?: React.ReactNode;
  onClick?(): void;
  url?: Url;
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
          <PromiseButton
            key={link.label}
            variant="subtle"
            color={Colors.foregroundPrimary}
            fullWidth
            onClick={
              link.onClick
                ? handleErrorFn(link.onClick)
                : link.url
                ? () => {
                    router.push(link.url!);
                  }
                : undefined
            }
            classNames={{
              inner: "justify-start",
            }}
          >
            <Group justify="flex-start" w="100%">
              {link.icon}
              {link.label}
            </Group>
          </PromiseButton>
        );
      })}
    </Stack>
  );
}
