import Colors from "@/common/constants/colors";
import { Stack } from "@mantine/core";
import React from "react";
import Text from "@/components/standard/text";
import { MaybeText } from "@/components/utility/maybe";

interface SupplementaryInfoFieldProps {
  label: string;
  value: React.ReactNode;
}

export function SupplementaryInfoField(props: SupplementaryInfoFieldProps) {
  return (
    <Stack align="center">
      <Text c={Colors.foregroundDull} size="sm">
        {props.label}
      </Text>
      <MaybeText c={Colors.foregroundPrimary} size="lg">
        {props.value}
      </MaybeText>
    </Stack>
  );
}
