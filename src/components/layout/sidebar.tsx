import { ActionIcon, Box, Flex, Title } from "@mantine/core";
import LayoutStyles from "./layout.module.css";
import { handleErrorFn } from "@/common/utils/form";
import Colors from "@/common/constants/colors";
import { useRouter } from "next/router";
import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import PromiseButton from "../standard/button/promise";
import { MaybeText } from "../utility/maybe";

export interface AppNavigationLink {
  label: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  onClick?(): void;
  href?: string;
  children?: AppNavigationLink[];
}

interface AppSidebarProps {
  title?: string;
  back?: boolean;
  links?: AppNavigationLink[];
}

interface AppSidebarLinkRendererProps {
  links: AppNavigationLink[];
}

function AppSidebarLinkRenderer({ links }: AppSidebarLinkRendererProps) {
  const router = useRouter();
  return (
    <>
      {links?.map((link) => {
        if (link.children) {
          return (
            <div key={link.key}>
              <Title order={3} className="flex justify-between">
                {link?.icon}
                <MaybeText>{link.label}</MaybeText>
              </Title>
              <AppSidebarLinkRenderer links={link.children} />
            </div>
          );
        }
        return (
          <PromiseButton
            key={link.key}
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

export default function AppSidebar(props: AppSidebarProps) {
  const router = useRouter();
  return (
    <Box className={LayoutStyles["sidebar"]}>
      <Flex gap={24} align="center">
        {props.back && (
          <ActionIcon
            variant="transparent"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft size={32} color={Colors.foregroundPrimary} />
          </ActionIcon>
        )}
        <Title order={1} style={{ fontFamily: "monospace" }}>
          {props.title ?? "WORDSMITH"}
        </Title>
      </Flex>
      {props.links && <AppSidebarLinkRenderer links={props.links} />}
    </Box>
  );
}
