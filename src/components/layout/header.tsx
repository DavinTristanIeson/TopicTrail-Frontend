import Colors from "@/common/constants/colors";
import { ActionIcon, Group, Title } from "@mantine/core";
import { ArrowLeft, DoorOpen } from "@phosphor-icons/react";
import { useRouter } from "next/router";
import Button from "../standard/button/base";

interface AppHeaderProps {
  back?: boolean;
  title?: string;
}

export default function AppHeader(props: AppHeaderProps) {
  const router = useRouter();
  return (
    <Group justify="space-between" className="flex-1">
      <Title order={1}>{props.title ?? "WORDSMITH"}</Title>
      {props.back && (
        <Button
          variant="outline"
          leftSection={<DoorOpen />}
          onClick={() => {
            router.back();
          }}
        >
          Go Back
        </Button>
      )}
    </Group>
  );
}
