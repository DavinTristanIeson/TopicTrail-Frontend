import { Skeleton } from '@mantine/core';
import dynamic from 'next/dynamic';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading() {
    return <Skeleton height={540} />;
  },
});

interface PlotRendererProps {
  plot: PlotParams;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot } = props;

  return (
    <Plot
      className="w-full h-full"
      {...plot}
      layout={{
        dragmode: 'pan',
        ...plot.layout,
      }}
      config={{
        scrollZoom: true,
        autosizable: true,
        responsive: true,
        displaylogo: false,
      }}
    />
  );
}
