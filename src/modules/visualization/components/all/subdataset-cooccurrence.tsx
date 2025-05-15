import { SubdatasetCooccurrenceModel } from '@/api/comparison';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { generateColorsFromSequence } from '@/common/utils/colors';
import { Select, Stack } from '@mantine/core';
import { PlotInlineConfiguration } from '../configuration';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { map2D } from '@/common/utils/iterable';

enum SubdatasetCoocccurrenceDisplayMode {
  Frequencies = 'frequencies',
  Cooccurrences = 'cooccurrences',
}

const SUBDATASET_COOCCURRENCE_DISPLAY_MODE_DICTIONARY = {
  [SubdatasetCoocccurrenceDisplayMode.Cooccurrences]: {
    label: 'Co-occurrences',
    value: SubdatasetCoocccurrenceDisplayMode.Cooccurrences,
    description:
      'Show how many rows overlap between every pair of subdatasets.',
  },
  [SubdatasetCoocccurrenceDisplayMode.Frequencies]: {
    label: 'Frequencies',
    value: SubdatasetCoocccurrenceDisplayMode.Frequencies,
    description: 'Show the actual frequencies of the subdatasets.',
  },
};

export default function VisualizationSubdatasetCooccurrenceComponent(
  props: BaseVisualizationComponentProps<SubdatasetCooccurrenceModel, object>,
) {
  const { data: originalData } = props;
  const data = originalData[0]?.data;
  if (!data) {
    throw new Error(
      'There is no data provided for subdataset co-occurrence component. This may be a developer oversight.',
    );
  }

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
    const z = map2D(data.cooccurrences, (value, row, col) =>
      row >= col ? undefined : value,
    ) as number[][];
    return {
      data: [
        {
          x: data.labels,
          y: data.labels,
          z: z,
          text: z as any,
          colorscale: 'Greens',
          colorbar: {
            title: 'Frequency',
          },
          type: 'heatmap',
        },
      ],
      layout: {
        xaxis: {
          title: 'Subdatasets',
        },
        yaxis: {
          title: 'Subdatasets',
        },
      },
    };
  }, [data.cooccurrences, data.labels]);

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
