import RHFField from '@/components/standard/fields';
import * as Yup from 'yup';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

export enum VisualizationProportionsDisplayMode {
  AreaChart = 'area-chart',
  BarChart = 'bar-chart',
  Heatmap = 'heatmap',
}

const VISUALIZATION_PROPORTIONS_DISPLAY_MODE_DICTIONARY = {
  [VisualizationProportionsDisplayMode.AreaChart]: {
    label: 'Area Chart',
    value: VisualizationProportionsDisplayMode.AreaChart,
    description:
      'Choose this method if you want to see the changes in proportions through ordered data. Otherwise, a bar chart may be more readable.',
  },
  [VisualizationProportionsDisplayMode.BarChart]: {
    label: 'Bar Chart',
    value: VisualizationProportionsDisplayMode.BarChart,
    description:
      'Choose this method if you want to compare the proportions of unordered data. Otherwise, an area chart may be more readable.',
  },
  [VisualizationProportionsDisplayMode.Heatmap]: {
    label: 'Heatmap',
    value: VisualizationProportionsDisplayMode.Heatmap,
    description:
      "Choose this method if you want to compare the proportions of unordered data, where each value should have the same size and the total proportion doesn't matter. Otherwise, a bar chart may represent the proportions more accurately through the sizes of its bars.",
  },
};

export const VisualizationProportionsConfigSchema = Yup.object({
  display: Yup.string()
    .oneOf(Object.values(VisualizationProportionsDisplayMode))
    .required(),
});

export type VisualizationProportionsConfigType = Yup.InferType<
  typeof VisualizationProportionsConfigSchema
>;

export function VisualizationProportionsConfigForm() {
  const renderOptionDisplay = useDescriptionBasedRenderOption(
    VISUALIZATION_PROPORTIONS_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <RHFField
      name="config.display"
      type="select"
      label="Display as"
      renderOption={renderOptionDisplay}
      data={Object.values(VISUALIZATION_PROPORTIONS_DISPLAY_MODE_DICTIONARY)}
      allowDeselect={false}
      required
    />
  );
}
