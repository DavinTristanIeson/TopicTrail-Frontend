import { ProjectTaskResult } from "@/api/project/model";
import { useStartTopicModeling } from "@/api/topics/mutation";
import { useGetTopicModelingStatus } from "@/api/topics/query";
import Colors from "@/common/constants/colors";
import { ProjectTaskStatus } from "@/common/constants/enum";
import Button from "@/components/standard/button/base";
import Text from "@/components/standard/text";
import { PollingRenderer, usePolling } from "@/hooks/polling";
import {
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Paper,
  PaperProps,
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
import dayjs, { Dayjs } from "dayjs";
import { showNotification } from "@mantine/notifications";
import { ApiResult } from "@/common/api/model";
import { handleErrorFn } from "@/common/utils/error";

interface ProcedureStatusProps {
  title: string;
  description: string;
  loading: boolean;
  data: ProjectTaskResult<unknown> | undefined;
  error: string | undefined;
  refetch(): void;
  execute(): Promise<ApiResult<unknown>>;
  refetchInterval?: number;
  /** Hide if idle or success */
  quiet?: boolean;

  // Components
  AboveDescription?: React.ReactNode;
  BelowDescription?: React.ReactNode;

  mantineProps?: {
    root?: PaperProps;
  };
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
    quiet,
    AboveDescription,
    BelowDescription,
    mantineProps,
  } = props;
  const [lastOperationTime, setLastOperationTime] = React.useState<
    Dayjs | undefined
  >(undefined);

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

  const isPending = data && ProjectTaskResult.isPending(data) && !error;
  if (error || data?.status === ProjectTaskStatus.Failed) {
    color = Colors.sentimentError;
    icon = <XCircle size={48} color={Colors.sentimentError} />;
    defaultMessage = error ?? "Sorry! An unexpected error has occurred.";
    actionMessage = "Try Again?";
    actionIcon = <Play />;
  } else if (!data) {
    color = Colors.text;
    icon = <Clock color={Colors.backgroundDull} size={48} />;
    actionMessage = "Start";
    actionIcon = <Play />;
    defaultMessage = description;
  } else if (data.status === ProjectTaskStatus.Idle) {
    color = Colors.backgroundDull;
    icon = <Clock color={Colors.backgroundDull} size={48} />;
    actionMessage = "Refresh";
    actionIcon = <ArrowClockwise />;
    defaultMessage =
      "The server is busy doing other tasks at the moment. Please wait for a few seconds...";
  } else if (data.status === ProjectTaskStatus.Pending) {
    color = Colors.foregroundPrimary;
    icon = <Loader size={32} color={Colors.foregroundPrimary}></Loader>;
    defaultMessage =
      "Please wait for a few seconds while we prepare everything...";
    actionMessage = "Refresh";
    actionIcon = <ArrowClockwise />;
  } else if (data.status === ProjectTaskStatus.Success) {
    color = Colors.sentimentSuccess;
    icon = <CheckCircle size={48} color={Colors.sentimentSuccess} />;
    defaultMessage = "The procedure has completed successfully.";
    actionMessage = "Run Again?";
    actionIcon = <Play />;
  } else {
    return null;
  }

  const canBeHidden =
    (data?.status === ProjectTaskStatus.Idle ||
      data?.status === ProjectTaskStatus.Success) &&
    !error;
  if (quiet && canBeHidden) {
    console.log("HELLO");
    return null;
  }

  return (
    <Paper shadow="sm" p={16} className="relative" {...mantineProps?.root}>
      <LoadingOverlay visible={loading} />
      <Group align="start" wrap="nowrap">
        <RingProgress
          size={96}
          label={<Group justify="center">{icon}</Group>}
          sections={[
            {
              color: color,
              value: (data?.progress ?? 0) * 100,
            },
          ]}
        />
        <Stack className="flex-1">
          <Text size="lg" fw="bold">
            {title}
          </Text>
          {AboveDescription}
          <Text wrap>{data?.message ?? defaultMessage}</Text>
          {BelowDescription}
          <Flex align="center" justify="space-between" direction="row-reverse">
            <Button
              leftSection={actionIcon}
              onClick={handleErrorFn(async () => {
                if (isPending) {
                  refetch();
                } else {
                  const res = await execute();
                  if (res.message) {
                    showNotification({
                      message: res.message,
                      color: Colors.sentimentSuccess,
                    });
                  }
                  refetch();
                }
                setLastOperationTime(dayjs());
              })}
            >
              {actionMessage}
            </Button>
            {lastOperationTime && (
              <PollingRenderer interval={5000}>
                {() => (
                  <Text c={Colors.foregroundDull}>{`Last ${
                    isPending ? "checked" : "ran"
                  } ${lastOperationTime.fromNow()}`}</Text>
                )}
              </PollingRenderer>
            )}
          </Flex>
        </Stack>
      </Group>
    </Paper>
  );
}
