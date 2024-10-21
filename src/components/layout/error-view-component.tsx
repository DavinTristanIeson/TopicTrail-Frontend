import { Box, Button, Flex, Loader, Title } from "@mantine/core";
import Text from "@/components/standard/text/base";
import Colors from "@/common/constants/colors";
import LayoutStyles from "./layout.module.css";

export interface ErrorViewComponentProps {
  title?: string;
  message?: string;
  refetch?: () => void;
}

export default function ErrorViewComponent(props: ErrorViewComponentProps) {
  const { title, message, refetch } = props;

  return (
    <Flex
      gap={8}
      align="center"
      direction="column"
      justify="center"
      w="100%"
      h="100%"
      className={LayoutStyles["error__root"]}
    >
      <Title order={3} c={Colors.textInverse}>
        {title ?? "Failed to load content"}
      </Title>
      {message && (
        <Text variant="regular" color="textInverse">
          {message}
        </Text>
      )}
      <Box h={8} />
      {refetch && (
        <Button
          variant="filled"
          onClick={refetch}
          color={Colors.sentimentError}
        >
          Refresh
        </Button>
      )}
    </Flex>
  );
}
