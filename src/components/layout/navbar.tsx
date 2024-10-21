import { ActionIcon, Box, Button, Flex, Title } from "@mantine/core";
import LayoutStyles from "./layout.module.css";
import { handleErrorFn } from "@/common/utils/form";
import { useLogout } from "@/api/auth";
import { showNotification } from "@mantine/notifications";
import Colors from "@/common/constants/colors";
import { useRouter } from "next/router";
import NavigationRoutes from "@/common/constants/routes";
import { SessionToken } from "@/common/auth/token";
import React from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import PromiseButton from "../standard/button/promise";

interface DashboardNavigationLink {
  label: string;
  onClick?(): void;
  href?: string;
}
interface DashboardNavigationBarProps {
  title?: string;
  back?: boolean;
  actions?: React.ReactNode;
  links?: DashboardNavigationLink[];
}

export default function DashboardNavigationBar(
  props: DashboardNavigationBarProps
) {
  const router = useRouter();
  return (
    <Box className={LayoutStyles["navbar"]}>
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
        <Title
          order={1}
          style={{ fontFamily: "monospace", fontStyle: "italic" }}
        >
          {props.title ?? "PARALLEL"}
        </Title>
      </Flex>
      {props.actions ??
        props.links?.map((link) => (
          <PromiseButton
            key={link.label}
            variant="subtle"
            color={Colors.foregroundPrimary}
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
        ))}
    </Box>
  );
}
