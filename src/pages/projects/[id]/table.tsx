import AppProjectLayout from "@/modules/projects/common/layout";
import { Stack, Title } from "@mantine/core";
import Text from "@/components/standard/text";
import { Warning } from "@phosphor-icons/react";

function ProjectTablePageBody() {
  return (
    <Stack>
      <Warning size={64} weight="fill" />
      <Title order={2}>Oops</Title>
      <Text>This place is under construction, come back later!</Text>
    </Stack>
  );
}

export default function ProjectTablePage() {
  return <AppProjectLayout>{() => <ProjectTablePageBody />}</AppProjectLayout>;
}
