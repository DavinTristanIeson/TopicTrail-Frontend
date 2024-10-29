import { Loader, Paper, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Text from "@/components/standard/text";
import { PlotParams } from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotRendererProps {
  plot: string;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot } = props;
  const plotParams = React.useMemo<PlotParams>(() => {
    return JSON.parse(plot);
  }, [plot]);

  return (
    <Suspense
      fallback={
        <Paper shadow="sm">
          <Stack>
            <Loader size={32} />
            <Text size="lg">Loading plot...</Text>
          </Stack>
        </Paper>
      }
    >
      <Plot {...plotParams} />
    </Suspense>
  );
}
