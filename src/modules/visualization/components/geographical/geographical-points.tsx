import { VisualizationGeographicalPointsModel } from '@/api/table';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationGeographicalAggregateValuesConfigType,
  VisualizationGeographicalFrequenciesConfigType,
} from '../../configuration/geographical-points';
import { sum } from 'lodash-es';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
} from '../configuration';
import { useVisualizationSubdatasetSelect } from '../configuration/subdatasets';
import { VISUALIZATION_AGGREGATION_METHOD_DICTIONARY } from '../../configuration/aggregate-values';
import { DashboardItemModel } from '@/api/userdata';
import { Select } from '@mantine/core';

interface VisualizationGeographicalMapProps {
  valueLabel: string;
  title: string;
  data: NamedData<VisualizationGeographicalPointsModel>[];
  item: DashboardItemModel;
}
function VisualizationGeographicalMap(
  props: VisualizationGeographicalMapProps,
) {
  const { data, valueLabel, title, item } = props;
  const { selectProps, viewedData } = useVisualizationSubdatasetSelect({
    data,
  });
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!viewedData) return undefined;
    const { data, name } = viewedData;
    const totalLatitudes = sum(data.latitudes);
    const totalLongitudes = sum(data.longitudes);
    const averageLatitude = totalLatitudes / data.latitudes.length;
    const averageLongitude = totalLongitudes / data.longitudes.length;
    const hasLabel = !!data.labels;
    return {
      data: [
        {
          name,
          type: 'densitymap' as any,
          mode: 'markers',
          lat: data.latitudes,
          lon: data.longitudes,
          z: data.values,
          customdata: data.labels ?? undefined,
          hovertemplate: [
            hasLabel ? '<b>Location</b>: %{customdata}' : undefined,
            '<b>Latitude</b>: %{lat}',
            '<b>Latitude</b>: %{lon}',
            `<b>${valueLabel}</b>: %{z}`,
          ]
            .filter(Boolean)
            .join('<br>'),
          colorscale: 'Viridis',
        },
      ],
      layout: {
        title,
        height: 720,
        map: {
          style: 'light',
          zoom: 2,
          center: {
            lat: averageLatitude,
            lon: averageLongitude,
          },
        },
      },
    };
  }, [title, valueLabel, viewedData]);
  const plotProps = usePlotRendererHelperProps(item);
  return (
    <>
      <PlotInlineConfiguration>
        <Select
          {...selectProps}
          label="Subdataset"
          description="Select a subdataset to visualize its locations."
        />
      </PlotInlineConfiguration>
      {plot && <PlotRenderer plot={plot} {...plotProps} />}
    </>
  );
}

export function VisualizationGeographicalFrequencyMap(
  props: BaseVisualizationComponentProps<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalFrequenciesConfigType
  >,
) {
  return (
    <VisualizationGeographicalMap
      {...props}
      title={`Frequency Distribution on Map`}
      valueLabel="Frequency"
    />
  );
}

export function VisualizationGeographicalAggregateValuesMap(
  props: BaseVisualizationComponentProps<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalAggregateValuesConfigType
  >,
) {
  const { item } = props;
  return (
    <VisualizationGeographicalMap
      {...props}
      valueLabel={
        VISUALIZATION_AGGREGATION_METHOD_DICTIONARY[item.config.method].label
      }
      title={`Values of ${item.column} Aggregated (${item.config.method}) by Location`}
    />
  );
}
