import { Skeleton } from '@mantine/core';
import { mergeWith } from 'lodash-es';
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
      layout={mergeWith(
        {
          dragmode: 'pan',
          xaxis: {
            automargin: true,
          },
          yaxis: {
            automargin: true,
          },
        },
        plot.layout,
      )}
      config={{
        scrollZoom: true,
        autosizable: true,
        responsive: true,
        displaylogo: false,
      }}
    />
  );
}
