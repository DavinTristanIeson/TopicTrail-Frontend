import { Alert, Button, Text } from '@mantine/core';
import { XCircle, ArrowClockwise } from '@phosphor-icons/react';
import {
  ErrorBoundary,
  ErrorComponent,
} from 'next/dist/client/components/error-boundary';
import React from 'react';

interface ErrorViewComponentProps {
  title?: string;
  message?: string;
  refetch?: () => void;
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

function DefaultErrorViewBoundaryRenderer(
  props: React.ComponentProps<ErrorComponent>,
) {
  const { error, reset } = props;
  React.useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorViewComponent message={error.message} refetch={reset} />;
}

export function DefaultErrorViewBoundary(props: React.PropsWithChildren) {
  return (
    <ErrorBoundary errorComponent={DefaultErrorViewBoundaryRenderer}>
      {props.children}
    </ErrorBoundary>
  );
}
