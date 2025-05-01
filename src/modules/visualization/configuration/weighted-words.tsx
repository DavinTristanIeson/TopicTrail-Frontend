import RHFField from '@/components/standard/fields';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import * as Yup from 'yup';

export enum VisualizationWeightedWordsDisplayMode {
  WordCloud = 'word-cloud',
  BarChart = 'bar-chart',
}

export const VisualizationWeightedWordsConfigSchema = Yup.object({
  display: Yup.string()
    .oneOf(Object.values(VisualizationWeightedWordsDisplayMode))
    .required(),
});

export type VisualizationWeightedWordsConfigType = Yup.InferType<
  typeof VisualizationWeightedWordsConfigSchema
>;

export const VISUALIZATION_WEIGHTED_WORDS_DISPLAY_MODE_DICTIONARY = {
  [VisualizationWeightedWordsDisplayMode.WordCloud]: {
    label: 'Word Cloud',
    value: VisualizationWeightedWordsDisplayMode.WordCloud,
    description:
      'Show all of the words in the shape of a cloud. Bigger words represent a greater value (e.g.: frequency or C-TF-IDF score).',
  },
  [VisualizationWeightedWordsDisplayMode.BarChart]: {
    label: 'Bar Chart',
    value: VisualizationWeightedWordsDisplayMode.BarChart,
    description:
      'Show all of the words as a bar chart. Longer bars represent a greater value (e.g.: frequency or C-TF-IDF score).',
  },
};

export function VisualizationWeightedWordsConfigForm() {
  const renderOptionDisplay = useDescriptionBasedRenderOption(
    VISUALIZATION_WEIGHTED_WORDS_DISPLAY_MODE_DICTIONARY,
  );
  return (
    <RHFField
      name="config.display"
      type="select"
      label="Display as"
      renderOption={renderOptionDisplay}
      data={Object.values(VISUALIZATION_WEIGHTED_WORDS_DISPLAY_MODE_DICTIONARY)}
      allowDeselect={false}
      required
    />
  );
}
