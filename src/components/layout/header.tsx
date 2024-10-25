import Colors from "@/common/constants/colors";
import { ActionIcon, Group, Title } from "@mantine/core";
import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/router";

interface AppHeaderProps {
  back?: boolean;
  title?: string;
}

export default function AppHeader(props: AppHeaderProps) {
  const router = useRouter();
  return (
    <>
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
      <Title order={1}>{props.title ?? "WORDSMITH"}</Title>
    </>
  );
}
