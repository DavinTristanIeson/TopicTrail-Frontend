import { generateColorsFromSequence } from '@/common/utils/colors';
import { BaseVisualizationComponentProps } from '../../types/base';
import type { PlotParams } from 'react-plotly.js';
import React from 'react';
import PlotRenderer from '@/components/widgets/plotly';
import {
  VisualizationContinuousDataDistributionConfigType,
  VisualizationContinuousDataDistributionDisplayMode,
} from '../../configuration/continuous-data-distribution';
import { usePlotRendererHelperProps } from '../configuration';
import { useProjectColumn } from '@/modules/project/context';
import { SchemaColumnTypeEnum } from '@/common/constants/enum';

function VisualizationContinuousDataDistributionViolinBoxPlot(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const { data, item } = props;
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(({ name, data }, idx) => {
      const isViolin =
        item.config.display ===
        VisualizationContinuousDataDistributionDisplayMode.ViolinPlot;
      return {
        name,
        y: data,
        type: isViolin ? 'violin' : 'box',
        box: isViolin
          ? {
              visible: true,
              width: 1,
            }
          : undefined,
        marker: {
          color: colors[idx],
        },
      };
    });
    return {
      data: subplots,
      layout: {
        title: `Continuous Data Distribution of ${item.column}`,
        xaxis: {
          title: 'Subdatasets',
          type: 'category',
        },
        yaxis: {
          title: item.column,
        },
      },
    } as PlotParams;
  }, [data, item.column, item.config.display]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationContinuousDataDistributionHistogram(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const { data, item } = props;
  const column = useProjectColumn(item.column);
  const plot = React.useMemo<PlotParams>(() => {
    const { colors } = generateColorsFromSequence(
      data.map((data) => data.name),
    );
    const subplots: PlotParams['data'] = data.map(({ name, data }, idx) => {
      return {
        name,
        x: data,
        type: 'histogram',
        hovertemplate: [
          `<b>${item.column}</b>: %{x}`,
          '<b>Frequency</b>: %{y}',
        ].join('<br>'),
        marker: {
          color: colors[idx],
        },
      };
    });
    const buttons = [
      {
        type: 'dropdown',
        direction: 'down',
        buttons: [
          {
            label: 'Auto',
            method: 'restyle',
            args: [
              {
                xbins: {
                  size: undefined,
                },
              },
            ],
          },
          {
            label: 'Daily',
            method: 'restyle',
            args: [
              {
                xbins: {
                  size: 'D1',
                },
              },
            ],
          },
          {
            label: 'Monthly',
            method: 'restyle',
            args: [
              {
                xbins: {
                  size: 'M1',
                },
              },
            ],
          },
          {
            label: 'Quarterly',
            method: 'restyle',
            args: [
              {
                xbins: {
                  size: 'M4',
                },
              },
            ],
          },
          {
            label: 'Yearly',
            method: 'restyle',
            args: [
              {
                xbins: {
                  size: 'M12',
                },
              },
            ],
          },
        ],
      },
    ] as PlotParams['layout']['updatemenus'];
    return {
      data: subplots,
      layout: {
        title: `Continuous Data Distribution of ${item.column}`,
        yaxis: {
          minallowed: 0,
        },
        barmode: 'group',
        updatemenus:
          column?.type === SchemaColumnTypeEnum.Temporal ? buttons : undefined,
      },
    } as PlotParams;
  }, [column?.type, data, item.column]);
  return <PlotRenderer plot={plot} {...usePlotRendererHelperProps(item)} />;
}

export function VisualizationContinuousDataDistributionRenderer(
  props: BaseVisualizationComponentProps<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
) {
  const mode = props.item.config.display;
  if (mode === VisualizationContinuousDataDistributionDisplayMode.Histogram) {
    return <VisualizationContinuousDataDistributionHistogram {...props} />;
  } else if (
    mode === VisualizationContinuousDataDistributionDisplayMode.BoxPlot ||
    mode === VisualizationContinuousDataDistributionDisplayMode.ViolinPlot
  ) {
    return <VisualizationContinuousDataDistributionViolinBoxPlot {...props} />;
  } else {
    throw Error(
      `${mode} is not a valid display mode for continuous data distribution.`,
    );
  }
}
