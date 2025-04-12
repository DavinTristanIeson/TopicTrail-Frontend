import { DescriptiveStatisticsModel } from '@/api/table';
import { DescriptiveStatisticsTable } from '../components/continuous/descriptive-statistics';
import { useDescriptiveStatisticsDataProvider } from '../data-provider/descriptive-statistics';
import { VisualizationConfigEntry } from './base';
import { DashboardItemTypeEnum } from './dashboard-item-types';

export const DASHBOARD_ITEM_CONFIGURATION: Record<
  DashboardItemTypeEnum,
  VisualizationConfigEntry<any, any>
> = {
  [DashboardItemTypeEnum.DescriptiveStatistics]: {
    type: DashboardItemTypeEnum.DescriptiveStatistics,
    label: 'Descriptive Statistics',
    description: '',
    component: DescriptiveStatisticsTable,
    dataProvider: useDescriptiveStatisticsDataProvider,
    configForm: null,
    configValidator: null,
  } as VisualizationConfigEntry<DescriptiveStatisticsModel, object>,
};
