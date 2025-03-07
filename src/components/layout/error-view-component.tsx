import { Box, Button, Flex, Title } from '@mantine/core';
import Text from '@/components/standard/text/base';
import Colors from '@/common/constants/colors';
import { ArrowClockwise } from '@phosphor-icons/react';

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
      className="bg-black/[0.2] p-3 rounded-xl"
    >
      <Title order={3}>{title ?? 'Failed to load content'}</Title>
      {message && <Text variant="regular">{message}</Text>}
      <Box h={8} />
      {refetch && (
        <Button
          miw={200}
          size="md"
          variant="filled"
          onClick={refetch}
          color={'red'}
          leftSection={<ArrowClockwise size={20} />}
        >
          Refresh
        </Button>
      )}
    </Flex>
  );
}
