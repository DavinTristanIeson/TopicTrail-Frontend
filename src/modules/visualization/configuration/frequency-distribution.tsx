import RHFField from '@/components/standard/fields';
import * as Yup from 'yup';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

export enum VisualizationFrequencyDistributonDisplayMode {
  LinePlot = 'line-plot',
  BarChart = 'bar-chart',
  Heatmap = 'heatmap',
}

export const VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY = {
  [VisualizationFrequencyDistributonDisplayMode.LinePlot]: {
    label: 'Line Plot',
    value: VisualizationFrequencyDistributonDisplayMode.LinePlot,
    description:
      'Choose this method if you want to compare many subdatasets at once. Otherwise, a bar chart may be more readable.',
  },
  [VisualizationFrequencyDistributonDisplayMode.BarChart]: {
    label: 'Bar Chart',
    value: VisualizationFrequencyDistributonDisplayMode.BarChart,
    description:
      'Choose this method if you want to compare one or two subdatasets. Otherwise, a line plot may be more readable.',
  },
  [VisualizationFrequencyDistributonDisplayMode.Heatmap]: {
    label: 'Heatmap',
    value: VisualizationFrequencyDistributonDisplayMode.Heatmap,
    description:
      'Choose this method if you want to compare many subdatasets and do not care as much about the absolute values and only about their relative differences. Otherwise, a bar chart or a line plot may be more readable.',
  },
};

export const VisualizationFrequencyDistributionConfigSchema = Yup.object({
  display: Yup.string()
    .oneOf(Object.values(VisualizationFrequencyDistributonDisplayMode))
    .required(),
});

export type VisualizationFrequencyDistributionConfigType = Yup.InferType<
  typeof VisualizationFrequencyDistributionConfigSchema
>;

export function VisualizationFrequencyDistributionConfigForm() {
  const renderOptionDisplay = useDescriptionBasedRenderOption(
    VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <RHFField
      name="config.display"
      type="select"
      label="Display as"
      renderOption={renderOptionDisplay}
      data={Object.values(
        VISUALIZATION_FREQUENCY_DISTRIBUTION_DISPLAY_MODE_DICTIONARY,
      )}
      allowDeselect={false}
      required
    />
  );
}
