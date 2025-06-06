import { Skeleton, useMantineTheme } from '@mantine/core';
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

// From https://github.com/phosphor-icons/core/blob/main/raw/regular/eye.svg
const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z" fill="none" stroke="gray" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><circle cx="128" cy="128" r="32" fill="none" stroke="gray" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>`;

interface PlotRendererProps {
  plot: PlotParams;
  height?: number;
  scrollZoom?: boolean;
}
export default function PlotRenderer(props: PlotRendererProps) {
  const { plot, height, scrollZoom } = props;
  const toggleState = React.useRef(true);
  const { colors } = useMantineTheme();
  return (
    <Plot
      className="w-full h-full"
      {...plot}
      layout={mergeWith(
        {
          dragmode: 'pan',
          xaxis: {},
          yaxis: {},
          height,
          modebar: {
            orientation: 'v',
            activecolor: colors.brand[6],
          },
        },
        plot.layout,
      )}
      config={{
        scrollZoom,
        autosizable: true,
        responsive: true,
        displaylogo: false,
        modeBarButtonsToAdd: [
          {
            name: 'Toggle Traces',
            title: 'Toggle Traces',
            icon: {
              width: 24,
              height: 24,
              svg: EYE_SVG,
            },
            toggle: false,
            // https://codepen.io/etpinard/pen/jMpeLG
            async click(gd) {
              // don't import from plotly.js directly, since it has uncompiled CSS
              // @ts-expect-error Plotly.js/dist only has JavaScript files, definitely won't have TypeScript definitions
              const Plotly = await import('plotly.js/dist/plotly');
              Plotly.restyle(
                gd,
                'visible',
                toggleState.current ? 'legendonly' : true,
              );
              toggleState.current = !toggleState.current;
            },
          },
        ],
      }}
    />
  );
}
