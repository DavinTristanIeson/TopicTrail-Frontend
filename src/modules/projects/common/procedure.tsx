import { ProjectTaskResult } from "@/api/project/model";
import { useStartTopicModeling } from "@/api/topics/mutation";
import { useGetTopicModelingStatus } from "@/api/topics/query";
import Colors from "@/common/constants/colors";
import { ProjectTaskStatus } from "@/common/constants/enum";
import Button from "@/components/standard/button/base";
import Text from "@/components/standard/text";
import { PollingRenderer, usePolling } from "@/hooks/polling";
import {
  Group,
  Loader,
  LoadingOverlay,
  Paper,
  RingProgress,
  Stack,
} from "@mantine/core";
import {
  ArrowClockwise,
  CheckCircle,
  Clock,
  Play,
  XCircle,
} from "@phosphor-icons/react";
import React from "react";
import dayjs from "dayjs";

interface ProcedureStatusProps {
  title: string;
  description: string;
  loading: boolean;
  data: ProjectTaskResult<unknown> | undefined;
  error: string | undefined;
  refetch(): void;
  execute(): void;
  refetchInterval?: number;
}

export default function ProcedureStatus(props: ProcedureStatusProps) {
  const {
    title,
    description,
    loading,
    data,
    error,
    refetch,
    execute,
    refetchInterval = 5000,
  } = props;
  const [operationTime, setLastOperationTime] = React.useState(dayjs());

  usePolling({
    fn: refetch,
    interval: refetchInterval,
    enabled: data ? ProjectTaskResult.isPending(data) : false,
  });

  let color: string,
    defaultMessage: string,
    icon: React.ReactNode,
    actionMessage: string,
    actionIcon: React.ReactNode;

  const isPending = data && ProjectTaskResult.isPending(data);
  if (error || props.data?.status === ProjectTaskStatus.Failed) {
    color = Colors.sentimentError;
    icon = <XCircle size={48} color={Colors.sentimentError} />;
    defaultMessage = error ?? "Sorry! An unexpected error has occurred.";
    actionMessage = "Try Again?";
    actionIcon = <Play />;
  } else if (!props.data) {
    color = Colors.backgroundDull;
    icon = <Clock color={Colors.backgroundDull} size={48} />;
    actionMessage = "Start";
    actionIcon = <Play />;
    defaultMessage = description;
  } else if (props.data.status === ProjectTaskStatus.Idle) {
    color = Colors.backgroundDull;
    icon = <Clock color={Colors.backgroundDull} size={48} />;
    actionMessage = "Refresh";
    actionIcon = <ArrowClockwise />;
    defaultMessage =
      "The server is busy doing other tasks at the moment. Please wait for a few seconds...";
  } else if (props.data.status === ProjectTaskStatus.Pending) {
    color = Colors.foregroundPrimary;
    icon = <Loader size={48} color={Colors.foregroundPrimary} />;
    defaultMessage =
      "Please wait for a few seconds while we prepare everything...";
    actionMessage = "Refresh";
    actionIcon = <ArrowClockwise />;
  } else if (props.data.status === ProjectTaskStatus.Success) {
    color = Colors.sentimentSuccess;
    icon = <CheckCircle size={48} color={Colors.sentimentSuccess} />;
    defaultMessage = "The procedure has completed successfully.";
    actionMessage = "Run Again?";
    actionIcon = <Play />;
  } else {
    return null;
  }

  return (
    <Paper shadow="sm" p={16} maw={600} className="relative">
      <LoadingOverlay visible={loading} />
      <Group align="start">
        <RingProgress
          size={96}
          label={<Group justify="center">{icon}</Group>}
          sections={[
            {
              color: Colors.foregroundPrimary,
              value: (data?.progress ?? 0) * 100,
            },
          ]}
        />
        <Stack className="flex-1">
          <Text size="lg" fw="bold">
            {title}
          </Text>
          <Text wrap>{data?.message ?? defaultMessage}</Text>
          <Group justify="space-between">
            <PollingRenderer interval={5000}>
              {() => (
                <Text>{`Last ${
                  isPending ? "checked" : "ran"
                } ${operationTime.fromNow()}`}</Text>
              )}
            </PollingRenderer>
            <Button
              loading={data ? ProjectTaskResult.isPending(data) : undefined}
              leftSection={actionIcon}
              onClick={() => {
                if (isPending) {
                  refetch();
                } else {
                  execute();
                }
                setLastOperationTime(dayjs());
              }}
            >
              {actionMessage}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
