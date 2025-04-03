import { DescriptiveStatisticsModel } from '@/api/table';
import { DescriptiveStatisticsTable } from './components/continuous/descriptive-statistics';
import { useDescriptiveStatisticsDataProvider } from './data-provider/descriptive-statistics';
import { BaseVisualizationConfig, VisualizationConfigEntry } from './types';

export const VALID_VISUALIZATION_COMPONENTS_FOR_TABLE_DASHBOARD: VisualizationConfigEntry<
  any,
  any
> = [
  {
    component: DescriptiveStatisticsTable,
    dataProvider: useDescriptiveStatisticsDataProvider,
    configManager: null,
    description: '',
    label: 'Descriptive Statistics',
    type: 'descriptive-statistics',
  } satisfies VisualizationConfigEntry<
    DescriptiveStatisticsModel,
    BaseVisualizationConfig
  >,
];
