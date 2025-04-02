import { Skeleton } from '@mantine/core';
import dynamic from 'next/dynamic';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import wordwrap from 'wordwrapjs';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading() {
    return <Skeleton height={540} />;
  },
});

export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}

interface PlotRendererProps {
  plot: PlotParams;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot } = props;

  return (
    <Plot
      {...plot}
      layout={{
        ...plot.layout,
        dragmode: 'pan',
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
