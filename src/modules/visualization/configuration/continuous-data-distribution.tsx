import * as Yup from 'yup';
import React from 'react';
import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

export enum VisualizationContinuousDataDistributionDisplayMode {
  Histogram = 'histogram',
  BoxPlot = 'box-plot',
  ViolinPlot = 'violin-plot',
}

const VISUALIZATION_CONTINUOUS_DATA_DISTRIBUTION_DISPLAY_MODE_DICTIONARY = {
  [VisualizationContinuousDataDistributionDisplayMode.BoxPlot]: {
    label: 'Box Plot',
    value: VisualizationContinuousDataDistributionDisplayMode.BoxPlot,
    description:
      'Box Plot can be used to get a visual overview of the descriptive statistics of a subdataset. If you want to view the shape of the distribution, use a Violin Plot instead. If you want to view the distribution of a single subdataset, use a Histogram instead.',
  },
  [VisualizationContinuousDataDistributionDisplayMode.ViolinPlot]: {
    label: 'Violin Plot',
    value: VisualizationContinuousDataDistributionDisplayMode.ViolinPlot,
    description:
      'Violin Plot can be used to get a visual overview of the descriptive statistics and distribution shape of a subdataset. If you want to view the distribution of a single subdataset, use a Histogram instead.',
  },
  [VisualizationContinuousDataDistributionDisplayMode.Histogram]: {
    label: 'Histogram',
    value: VisualizationContinuousDataDistributionDisplayMode.Histogram,
    description:
      'Histograms can be used to view distribution shape of a subdataset. If you want to view the distribution of multiple subdatasets, use a Box Plot or Violin Plot instead.',
  },
};

export const VisualizationContinuousDataDistributionConfigSchema = Yup.object({
  display: Yup.string()
    .oneOf(Object.values(VisualizationContinuousDataDistributionDisplayMode))
    .required(),
});

export type VisualizationContinuousDataDistributionConfigType = Yup.InferType<
  typeof VisualizationContinuousDataDistributionConfigSchema
>;

export function VisualizationContinuousDataDistributionConfigForm() {
  const renderOption = useDescriptionBasedRenderOption(
    VISUALIZATION_CONTINUOUS_DATA_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <>
      <RHFField
        type="select"
        name="config.display"
        label="Display as"
        renderOption={renderOption}
        data={Object.values(
          VISUALIZATION_CONTINUOUS_DATA_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
        )}
        required
        allowDeselect={false}
      />
    </>
  );
}
