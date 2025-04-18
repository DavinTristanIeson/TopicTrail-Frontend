import RHFField from '@/components/standard/fields';
import * as Yup from 'yup';
import {
  CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY,
  CategoricalDataFrequencyMode,
} from '../components/categorical/utils';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { Group } from '@mantine/core';

export enum VisualizationFrequencyDistributonDisplayMode {
  LinePlot = 'line-plot',
  BarChart = 'bar-chart',
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
};

export function FrequencyDistributionDisplayModeSelectField() {
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

export const VisualizationFrequencyDistributionConfigSchema = Yup.object({
  mode: Yup.string()
    .oneOf(Object.values(CategoricalDataFrequencyMode))
    .required(),
  display: Yup.string()
    .oneOf(Object.values(VisualizationFrequencyDistributonDisplayMode))
    .required(),
});

export type VisualizationFrequencyDistributionConfigType = Yup.InferType<
  typeof VisualizationFrequencyDistributionConfigSchema
>;

export function VisualizationFrequencyDistributionConfigForm() {
  const renderOptionMode = useDescriptionBasedRenderOption(
    CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY,
  );

  return (
    <Group align="start">
      <RHFField
        name="config.mode"
        type="select"
        label="Frequency Mode"
        renderOption={renderOptionMode}
        data={Object.values(CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY)}
        allowDeselect={false}
        required
      />
      <FrequencyDistributionDisplayModeSelectField />
    </Group>
  );
}
