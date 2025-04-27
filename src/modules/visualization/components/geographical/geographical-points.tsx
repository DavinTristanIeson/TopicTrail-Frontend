import { VisualizationGeographicalPointsModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import { VisualizationGeographicalPointsConfigType } from '../../configuration/geographical-points';
import { sum } from 'lodash-es';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
} from '../configuration';
import { useVisualizationSubdatasetSelect } from '../configuration/subdatasets';

export default function VisualizationGeographicalMap(
  props: BaseVisualizationComponentProps<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalPointsConfigType
  >,
) {
  const { data, item } = props;
  const { Component, viewedData } = useVisualizationSubdatasetSelect({
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
          z: data.sizes,
          customdata: data.labels ?? undefined,
          hovertemplate: [
            hasLabel ? '<b>Location</b>: %{customdata}' : undefined,
            '<b>Latitude</b>: %{lat}',
            '<b>Latitude</b>: %{lon}',
            '<b>Frequency</b>: %{z}',
          ]
            .filter(Boolean)
            .join('<br>'),
          colorscale: 'Viridis',
        },
      ],
      layout: {
        title: `Coordinates of ${item.config.latitude_column} and ${item.config.longitude_column}`,
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
  }, [item, viewedData]);
  const plotProps = usePlotRendererHelperProps(item);
  return (
    <>
      <PlotInlineConfiguration>{Component}</PlotInlineConfiguration>
      {plot && <PlotRenderer plot={plot} {...plotProps} />}
    </>
  );
}
