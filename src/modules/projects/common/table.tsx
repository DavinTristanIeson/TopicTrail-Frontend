import Colors from "@/common/constants/colors";
import { Stack, Tooltip } from "@mantine/core";
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
    <Stack align="center">
      <Text c={Colors.foregroundDull} size="sm">
        {props.label}
        {props.tooltip && (
          <Tooltip label={props.tooltip}>
            <Info color={Colors.foregroundDull} />
          </Tooltip>
        )}
      </Text>
      <MaybeText c={props.color ?? Colors.foregroundPrimary} size="lg">
        {props.value}
      </MaybeText>
    </Stack>
  );
}
