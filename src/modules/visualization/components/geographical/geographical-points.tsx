import { VisualizationGeographicalPointsModel } from '@/api/table';
import { BaseVisualizationComponentProps, NamedData } from '../../types/base';
import React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationGeographicalAggregateValuesConfigType,
  VisualizationGeographicalFrequenciesConfigType,
} from '../../configuration/geographical-points';
import { max, min, sum, zip } from 'lodash-es';
import {
  PlotInlineConfiguration,
  usePlotRendererHelperProps,
} from '../configuration';
import { useVisualizationSubdatasetSelect } from '../configuration/subdatasets';
import { VISUALIZATION_AGGREGATION_METHOD_DICTIONARY } from '../../configuration/aggregate-values';
import { DashboardItemModel } from '@/api/userdata';
import { Checkbox, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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
  const [withHeatmap, { toggle: toggleHeatmap }] = useDisclosure(true);
  const [withScatter, { toggle: toggleScatter }] = useDisclosure(true);
  const plot = React.useMemo<PlotParams | undefined>(() => {
    if (!viewedData) return undefined;
    const { data, name } = viewedData;
    const totalLatitudes = sum(data.latitudes);
    const totalLongitudes = sum(data.longitudes);
    const averageLatitude = totalLatitudes / data.latitudes.length;
    const averageLongitude = totalLongitudes / data.longitudes.length;
    const hasLabel = !!data.labels;
    const customdata = data.labels
      ? zip(data.values, data.labels)
      : zip(data.values);
    const subplots: PlotParams['data'] = [];
    if (withHeatmap) {
      subplots.push({
        name: `${name} (Density)`,
        type: 'densitymap' as any,
        mode: 'markers',
        lat: data.latitudes,
        lon: data.longitudes,
        z: data.values,
        colorscale: 'Viridis',
        hoverinfo: 'none',
        colorbar: {
          title: `${valueLabel} (Density)`,
          x: withScatter ? 1.15 : undefined,
        },
      });
    }
    if (withScatter) {
      subplots.push({
        name,
        type: 'scattermap' as any,
        mode: (data.labels ? 'markers+text' : 'markers') as any,
        text: data.labels ?? undefined,
        lat: data.latitudes,
        lon: data.longitudes,
        customdata: customdata,
        marker: {
          color: data.values,
          cmin: min(data.values) ?? 0,
          cmax: max(data.values) ?? 0,
          colorscale: 'Viridis',
          colorbar: {
            title: valueLabel,
          },
        },
        hovertemplate: [
          hasLabel ? '<b>Location</b>: %{customdata[1]}' : undefined,
          '<b>Latitude</b>: %{lat}',
          '<b>Latitude</b>: %{lon}',
          `<b>${valueLabel}</b>: %{customdata[0]}`,
        ]
          .filter(Boolean)
          .join('<br>'),
      });
    }
    return {
      data: subplots,
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
  }, [title, valueLabel, viewedData, withHeatmap, withScatter]);
  const plotProps = usePlotRendererHelperProps(item);
  return (
    <>
      <PlotInlineConfiguration>
        <Select
          {...selectProps}
          label="Subdataset"
          description="Select a subdataset to visualize its locations."
        />
        <Checkbox
          checked={withHeatmap}
          onChange={toggleHeatmap}
          label="Show heatmap"
          description="Heatmaps show the distribution of data on the map. Brighter colors represent denser regions."
        />
        <Checkbox
          checked={withScatter}
          onChange={toggleScatter}
          label="Show scatter plot"
          description="Scatter plot show the actual data points on the map."
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
