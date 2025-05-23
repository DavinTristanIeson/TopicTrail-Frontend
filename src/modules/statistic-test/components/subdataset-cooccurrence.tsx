import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { Select, Stack } from '@mantine/core';
import { PlotInlineConfiguration } from '@/modules/visualization/components/configuration';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { map2D, zip2D } from '@/common/utils/iterable';
import { max } from 'lodash-es';
import { BaseStatisticTestResultRendererProps } from '../types';

enum SubdatasetCoocccurrenceDisplayMode {
  Frequencies = 'frequencies',
  Cooccurrences = 'cooccurrences',
  CooccurrenceProportions = 'cooccurrence-proportions',
}

const SUBDATASET_COOCCURRENCE_DISPLAY_MODE_DICTIONARY = {
  [SubdatasetCoocccurrenceDisplayMode.Cooccurrences]: {
    label: 'Co-occurrences',
    value: SubdatasetCoocccurrenceDisplayMode.Cooccurrences,
    description:
      'Show how many rows overlap between every pair of subdatasets.',
  },
  [SubdatasetCoocccurrenceDisplayMode.CooccurrenceProportions]: {
    label: 'Co-occurrence Proportions',
    value: SubdatasetCoocccurrenceDisplayMode.CooccurrenceProportions,
    description:
      'Show how the proportions of overlapping rows compared to the actual frequencies.',
  },
  [SubdatasetCoocccurrenceDisplayMode.Frequencies]: {
    label: 'Frequencies',
    value: SubdatasetCoocccurrenceDisplayMode.Frequencies,
    description: 'Show the actual frequencies of the subdatasets.',
  },
};

export default function SubdatasetCooccurrenceResultRenderer(
  props: BaseStatisticTestResultRendererProps<
    SubdatasetCooccurrenceModel,
    object
  >,
) {
  const { data } = props;

  const [display, setDisplay] = React.useState(
    SubdatasetCoocccurrenceDisplayMode.Cooccurrences,
  );

  const frequenciesPlot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(data.labels);
    return {
      data: [
        {
          x: data.labels,
          y: data.frequencies,
          type: 'bar',
          marker: {
            color: colors,
          },
          hovertemplate: [
            '<b>Subdataset</b>: %{x}',
            '<b>Frequency</b>: %{y}',
          ].join('<br>'),
        },
      ],
      layout: {
        xaxis: {
          title: 'Subdatasets',
        },
        yaxis: {
          title: 'Frequencies',
          minallowed: 0,
        },
      },
    };
  }, [data.frequencies, data.labels]);
  const cooccurrencesPlot = React.useMemo<PlotParams>(() => {
    const z = data.cooccurrences;
    const maxZ = max(data.cooccurrences.map((row) => max(row) ?? 0)) ?? 0;
    const frequencies = map2D(
      data.cooccurrences,
      (value, row, col) => data.frequencies[col],
    );
    const isProportion =
      display == SubdatasetCoocccurrenceDisplayMode.CooccurrenceProportions;
    const proportionsZ = map2D(data.cooccurrences, (value) =>
      value == null ? undefined : maxZ == 0 ? 0 : (value * 100) / maxZ,
    );
    return {
      data: [
        {
          name: 'Co-occurrences',
          x: data.labels,
          y: data.labels,
          z: map2D(isProportion ? proportionsZ : z, (value, row, col) =>
            row <= col ? undefined : value,
          ) as number[][],
          zmin: isProportion ? 0 : undefined,
          zmax: isProportion ? 100 : undefined,
          texttemplate: isProportion ? '%{z:.3f}%' : '%{z}',
          colorscale: 'Viridis',
          colorbar: {
            title: isProportion ? 'Proportion' : 'Frequency',
          },
          hoverongaps: false,
          type: 'heatmap',
          customdata: zip2D([z, proportionsZ, frequencies]) as any,
          hovertemplate: [
            '<b>Subdataset 1</b>: %{x}',
            '<b>Subdataset 2</b>: %{y}',
            '<b>Co-occurrence</b>: %{customdata[0]}',
            '<b>Proportion</b>: %{customdata[1]:.3f}%',
            '<b>Marginal Frequency</b>: %{customdata[2]}',
          ].join('<br>'),
        },
      ],
      layout: {
        title: `Subdataset Co-occurrence`,
        xaxis: {
          title: 'Subdatasets',
        },
        yaxis: {
          title: 'Subdatasets',
          autorange: 'reversed',
        },
      },
    };
  }, [data.cooccurrences, data.frequencies, data.labels, display]);

  const renderOption = useDescriptionBasedRenderOption(
    SUBDATASET_COOCCURRENCE_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <Stack>
      <PlotInlineConfiguration>
        <Select
          data={Object.values(SUBDATASET_COOCCURRENCE_DISPLAY_MODE_DICTIONARY)}
          value={display}
          onChange={
            setDisplay as React.Dispatch<React.SetStateAction<string | null>>
          }
          allowDeselect={false}
          renderOption={renderOption}
          label="Display Mode"
          required
        />
      </PlotInlineConfiguration>
      {display && (
        <PlotRenderer
          plot={
            display === SubdatasetCoocccurrenceDisplayMode.Frequencies
              ? frequenciesPlot
              : cooccurrencesPlot
          }
        />
      )}
    </Stack>
  );
}
