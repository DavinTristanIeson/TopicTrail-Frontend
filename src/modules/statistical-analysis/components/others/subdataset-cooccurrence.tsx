import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { Select, Stack } from '@mantine/core';
import { PlotInlineConfiguration } from '@/modules/visualization/components/configuration';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { map2D, mask2D, zip2D } from '@/common/utils/iterable';
import { BaseStatisticTestResultRendererProps } from '../../types';
import { sum } from 'lodash-es';

enum SubdatasetCoocccurrenceDisplayMode {
  Frequencies = 'frequencies',
  Cooccurrences = 'cooccurrences',
  CooccurrenceProportions = 'cooccurrence-proportions',
  Correlations = 'correlation',
}

const SUBDATASET_COOCCURRENCE_DISPLAY_MODE_DICTIONARY = {
  [SubdatasetCoocccurrenceDisplayMode.Cooccurrences]: {
    label: 'Co-occurrences',
    value: SubdatasetCoocccurrenceDisplayMode.Cooccurrences,
    description:
      'Show how many rows overlap between every pair of subdatasets.',
  },
  [SubdatasetCoocccurrenceDisplayMode.Correlations]: {
    label: 'Correlations',
    value: SubdatasetCoocccurrenceDisplayMode.Correlations,
    description:
      'Show the correlation between every pair of subdatasets. The correlation method used is Pearson correlation, which reduces to point-biserial correlation for binary variables (each subdataset is treated as a binary variable). Correlation near 1 indicates that both subdatasets are strongly related to each other; while correlation near -1 indicates that both subdatasets are strongly inversely related to each other.',
  },
  [SubdatasetCoocccurrenceDisplayMode.CooccurrenceProportions]: {
    label: 'Co-occurrence Proportions',
    value: SubdatasetCoocccurrenceDisplayMode.CooccurrenceProportions,
    description:
      'Show the proportion of rows for every subdataset that co-occur with other subdatasets.',
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
    const correlations = data.correlations;
    const cooccurrences = data.cooccurrences;
    const cooccurrenceProportions = data.cooccurrences.map((row) => {
      const rowTotal = sum(row);
      return row.map((col) => (col * 100) / rowTotal);
    });
    const mask = map2D(data.cooccurrences, (_, row, col) => row <= col);
    let z: number[][];
    let title: string;
    let colorbarTitle: string;
    let zmin: number | undefined = undefined;
    let zmax: number | undefined = undefined;
    let colorscale: string = 'Viridis';
    let texttemplate: string;
    if (display === SubdatasetCoocccurrenceDisplayMode.Cooccurrences) {
      z = mask2D(cooccurrences, mask, undefined) as number[][];
      title = 'Co-occurrences of Subdatasets';
      colorbarTitle = 'Co-occurrence';
      texttemplate = '%{z}';
    } else if (display === SubdatasetCoocccurrenceDisplayMode.Correlations) {
      z = mask2D(correlations, mask, undefined) as number[][];
      title = 'Correlations of Subdatasets';
      colorbarTitle = 'Correlation';
      zmin = -1;
      zmax = 1;
      colorscale = 'RdBu';
      texttemplate = '%{z:.3f}';
    } else {
      z = cooccurrenceProportions as number[][];
      title = 'Co-occurrence Proportions of Each Subdataset';
      colorbarTitle = 'Proportion';
      texttemplate = '%{z:.3f}%';
    }
    const customdata = zip2D([
      cooccurrences,
      cooccurrenceProportions,
      correlations,
    ]) as any;
    return {
      data: [
        {
          x: data.labels,
          y: data.labels,
          z: z,
          zmin: zmin,
          zmax: zmax,
          texttemplate,
          colorscale: colorscale,
          colorbar: {
            title: colorbarTitle,
          },
          hoverongaps: false,
          type: 'heatmap',
          customdata: customdata,
          hovertemplate: [
            '<b>Subdataset 1</b>: %{x}',
            '<b>Subdataset 2</b>: %{y}',
            `<b>Co-occurrence</b>: %{customdata[0]}`,
            `<b>Proportion</b>: %{customdata[1]:.3f}%`,
            `<b>Correlation</b>: %{customdata[2]}`,
          ].join('<br>'),
        },
      ],
      layout: {
        title: title,
        xaxis: {
          title: 'Subdatasets',
        },
        yaxis: {
          title: 'Subdatasets',
          autorange: 'reversed',
        },
      },
    };
  }, [data.cooccurrences, data.correlations, data.labels, display]);

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
          scrollZoom={false}
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
