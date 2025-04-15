import { DescriptiveStatisticsModel } from '@/api/table';
import { DescriptiveStatisticsTableComponent } from '../components/continuous/descriptive-statistics';
import { useVisualizationDescriptiveStatisticsDataProvider } from '../data-provider/descriptive-statistics';
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
    component: DescriptiveStatisticsTableComponent,
    dataProvider: useVisualizationDescriptiveStatisticsDataProvider,
    configForm: null,
    configValidator: null,
  } as VisualizationConfigEntry<DescriptiveStatisticsModel, object>,
};
