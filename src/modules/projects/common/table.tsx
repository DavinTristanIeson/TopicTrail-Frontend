import Colors from "@/common/constants/colors";
import { Group, Stack, Tooltip } from "@mantine/core";
import React from "react";
import Text from "@/components/standard/text";
import { MaybeText } from "@/components/utility/maybe";
import { Info } from "@phosphor-icons/react";

interface SupplementaryInfoFieldProps {
  label: string;
  value: React.ReactNode;
  color?: string;
  tooltip?: string;
}

export function SupplementaryInfoField(props: SupplementaryInfoFieldProps) {
  return (
    <Stack align="center" gap={0}>
      <Group gap={4}>
        <Text c={Colors.foregroundDull} size="sm">
          {props.label}
        </Text>
        {props.tooltip && (
          <Tooltip
            label={props.tooltip}
            withArrow
            classNames={{
              tooltip: "text-wrap p-2",
            }}
            color={Colors.backgroundPrimary}
            maw={300}
          >
            <Info color={Colors.foregroundDull} />
          </Tooltip>
        )}
      </Group>
      <MaybeText c={props.color ?? Colors.text} size="lg">
        {props.value}
      </MaybeText>
    </Stack>
  );
}
