import Colors from "@/common/constants/colors";
import { RingProgress, Stack, useMantineTheme } from "@mantine/core";
import React from "react";
import Text from "@/components/standard/text";
import { VariableAssociationModel } from "@/api/association";

export default function ProjectAssociationExcludedDonut(
  data: VariableAssociationModel
) {
  const excludedIntersect =
    data.excludedLeft + data.excludedRight - data.excluded;
  const excludeIntersectPercentage = (excludedIntersect / data.total) * 100;
  const excludeLeftPercentage =
    ((data.excludedLeft - excludedIntersect) / data.total) * 100;
  const excludeRightPercentage =
    ((data.excludedRight - excludedIntersect) / data.total) * 100;
  const validPercentage = ((data.total - data.excluded) / data.total) * 100;

  const theme = useMantineTheme();

  return (
    <RingProgress
      size={180}
      thickness={16}
      label={
        <Stack align="center" gap={0}>
          <Text
            size="xs"
            ta="center"
            px="xs"
            style={{ pointerEvents: "none" }}
            c={Colors.foregroundDull}
          >
            Total
          </Text>
          <Text size="lg" c={Colors.foregroundPrimary} fw="bold">
            {data.total}
          </Text>
        </Stack>
      }
      sections={[
        {
          value: excludeLeftPercentage!,
          color: theme.colors.pink[5],
          tooltip: `Excluded from ${
            data.column1
          } (${excludeLeftPercentage!.toFixed(2)}%)`,
        },
        {
          value: excludeRightPercentage!,
          color: theme.colors.red[5],
          tooltip: `Excluded from ${
            data.column1
          } (${excludeRightPercentage!.toFixed(2)}%)`,
        },
        {
          value: excludeIntersectPercentage!,
          color: theme.colors.orange[5],
          tooltip: `Excluded from both (${excludeIntersectPercentage.toFixed(
            2
          )}%)`,
        },
        {
          value: validPercentage!,
          color: Colors.foregroundPrimary,
          tooltip: `Valid (${validPercentage.toFixed(2)}%)`,
        },
      ]}
    />
  );
}
