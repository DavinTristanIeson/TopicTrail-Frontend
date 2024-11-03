import { Loader, Paper, Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import Text from "@/components/standard/text";
import { PlotParams } from "react-plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PlotRendererProps {
  plot: string;
  width?: number;
  height?: number;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot, width = 1280, height = 720 } = props;
  const plotParams = React.useMemo<PlotParams>(() => {
    return JSON.parse(plot);
  }, [plot]);

  return (
    <Suspense
      fallback={
        <Paper shadow="sm">
          <Stack align="center">
            <Loader size={32} />
            <Text size="lg">Loading plot...</Text>
          </Stack>
        </Paper>
      }
    >
      <Plot
        {...plotParams}
        layout={{
          ...plotParams.layout,
          width,
          height,
        }}
        config={{
          scrollZoom: true,
          autosizable: true,
          responsive: true,
          displaylogo: false,
        }}
      />
    </Suspense>
  );
}
