import AppLayout from "@/components/layout/app";
import AppSidebar from "@/components/layout/sidebar";
import { Title, Text, Flex, Box } from "@mantine/core";

export default function Dashboard() {
  return (
    <AppLayout
      Aside={
        <AppSidebar
          links={[
            {
              label: "Recent Projects",
              children: [{}],
            },
          ]}
        />
      }
    >
      <Box>
        <Flex align="center" justify="center" w="100%" h="100%">
          <Title order={2}>Choose a Project!</Title>
          <Text>
            Looks like you haven't opened any projects yet. Pick a project or
            create a new project from the side bar to get started.
          </Text>
        </Flex>
      </Box>
    </AppLayout>
  );
}
