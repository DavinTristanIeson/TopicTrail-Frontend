import RHFField from '@/components/standard/fields';
import * as Yup from 'yup';
import {
  CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY,
  CategoricalDataFrequencyMode,
} from '../components/categorical/utils';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';

export const VisualizationFrequencyDistributionConfigSchema = Yup.object({
  mode: Yup.string()
    .oneOf(Object.values(CategoricalDataFrequencyMode))
    .required(),
});

export type VisualizationFrequencyDistributionConfigType = Yup.InferType<
  typeof VisualizationFrequencyDistributionConfigSchema
>;

export function VisualizationFrequencyDistributionConfigForm() {
  const renderOption = useDescriptionBasedRenderOption(
    CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY,
  );
  return (
    <>
      <RHFField
        name="config.mode"
        type="select"
        label="Frequency Mode"
        renderOption={renderOption}
        data={Object.values(CATEGORICAL_DATA_FREQUENCY_MODE_DICTIONARY)}
        allowDeselect={false}
        required
      />
    </>
  );
}
