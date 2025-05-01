import { Skeleton } from '@mantine/core';
import { mergeWith } from 'lodash-es';
import dynamic from 'next/dynamic';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading() {
    return <Skeleton height={540} />;
  },
});

interface PlotRendererProps {
  plot: PlotParams;
  height?: number;
  scrollZoom?: boolean;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot, height, scrollZoom = true } = props;

  return (
    <Plot
      className="w-full h-full"
      {...plot}
      layout={mergeWith(
        {
          dragmode: 'pan',
          xaxis: {
            automargin: true,
          },
          yaxis: {
            automargin: true,
          },
          height,
        },
        plot.layout,
      )}
      config={{
        scrollZoom,
        autosizable: true,
        responsive: true,
        displaylogo: false,
      }}
    />
  );
}
