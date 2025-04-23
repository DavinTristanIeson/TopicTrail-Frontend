import { VisualizationGeographicalPointsModel } from '@/api/table';
import { BaseVisualizationComponentProps } from '../../types/base';
import React from 'react';
import { PlotParams } from 'react-plotly.js';
import { generateColorsFromSequence } from '@/common/utils/colors';
import PlotRenderer from '@/components/widgets/plotly';
import { VisualizationGeographicalPointsConfigType } from '../../configuration/geographical-points';
import { sum } from 'lodash-es';
import { usePlotRendererHelperProps } from '../utils';

export default function VisualizationGeographicalMap(
  props: BaseVisualizationComponentProps<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalPointsConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((subdataset) => subdataset.name),
    );
    const allLatitudes = data.flatMap((subdataset) => subdataset.data.latitude);
    const allLongitudes = data.flatMap(
      (subdataset) => subdataset.data.longitude,
    );
    const totalLatitudes = sum(allLatitudes);
    const totalLongitudes = sum(allLongitudes);
    const averageLatitude = totalLatitudes / allLatitudes.length;
    const averageLongitude = totalLongitudes / allLongitudes.length;
    return {
      data: data.map((subdataset, idx) => {
        return {
          name: subdataset.name,
          type: 'scattergeo',
          mode: 'markers',
          lat: subdataset.data.latitude,
          lon: subdataset.data.longitude,
          marker: {
            color: colors[idx],
            size: subdataset.data.sizes,
          },
        };
      }),
      layout: {
        title: `Coordinates of ${item.config.latitude_column} and ${item.config.longitude_column}`,
        map: {
          style: 'open-street-map',
          zoom: 2,
          center: {
            lat: averageLatitude,
            lon: averageLongitude,
          },
        },
        margin: { r: 0, t: 0, b: 0, l: 0 },
      },
    };
  }, [data, item.config.latitude_column, item.config.longitude_column]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}
