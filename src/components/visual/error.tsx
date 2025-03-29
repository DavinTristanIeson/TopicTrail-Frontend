import { Alert, Button, Text } from '@mantine/core';
import { XCircle, ArrowClockwise } from '@phosphor-icons/react';

interface ErrorViewComponentProps {
  title?: string;
  message?: string;
  refetch: () => void;
}

export function ErrorViewComponent(props: ErrorViewComponentProps) {
  const { title, message, refetch } = props;

  return (
    <Alert
      title={title ?? 'Failed to load content'}
      color="red"
      icon={<XCircle />}
    >
      <Text inherit>{message}</Text>
      {refetch && (
        <Button
          className="max-w-md mt-3"
          fullWidth
          size="md"
          variant="filled"
          onClick={refetch}
          color="red"
          leftSection={<ArrowClockwise />}
        >
          Retry
        </Button>
      )}
    </Alert>
  );
}
