import { handleErrorFn } from "@/common/utils/error";
import Colors from "@/common/constants/colors";
import { useRouter } from "next/router";
import React from "react";
import PromiseButton from "../standard/button/promise";

export interface AppNavigationLink {
  label: string;
  icon?: React.ReactNode;
  onClick?(): void;
  href?: string;
}
interface AppSidebarLinkRendererProps {
  links: AppNavigationLink[];
}

export function AppSidebarLinkRenderer({ links }: AppSidebarLinkRendererProps) {
  const router = useRouter();
  return (
    <>
      {links?.map((link) => {
        return (
          <PromiseButton
            key={link.label}
            variant="subtle"
            color={Colors.foregroundPrimary}
            leftSection={link.icon}
            onClick={
              link.onClick
                ? handleErrorFn(link.onClick)
                : link.href
                ? () => {
                    router.push(link.href!);
                  }
                : undefined
            }
          >
            {link.label}
          </PromiseButton>
        );
      })}
    </>
  );
}
