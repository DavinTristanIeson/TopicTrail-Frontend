import {
  DescriptiveStatisticsModel,
  VisualizationAggregateValuesModel,
  VisualizationColumnCountsModel,
  VisualizationFrequencyDistributionModel,
  VisualizationGeographicalPointsModel,
  VisualizationTableWordFrequenciesModel,
} from '@/api/table';
import { DescriptiveStatisticsTableComponent } from '../components/continuous/descriptive-statistics';
import { useVisualizationDescriptiveStatisticsDataProvider } from '../data-provider/descriptive-statistics';
import { VisualizationConfigEntry } from './base';
import { DashboardItemTypeEnum } from './dashboard-item-types';
import VisualizationFrequencyDistributionRenderer from '../components/categorical/frequency-distribution';
import { useVisualizationAggregatedTotalsDataProvider } from '../data-provider/aggregate';
import {
  VisualizationAggregateValuesConfigForm,
  VisualizationAggregateValuesConfigSchema,
  VisualizationAggregateValuesConfigType,
} from '../configuration/aggregate-values';
import VisualizationColumnCountsRingChart from '../components/all/counts';
import { useVisualizationColumnCountsDataProvider } from '../data-provider/counts';
import { useVisualizationFrequencyDistributionDataProvider } from '../data-provider/frequency-distribution';
import {
  VisualizationFrequencyDistributionConfigForm,
  VisualizationFrequencyDistributionConfigSchema,
  VisualizationFrequencyDistributionConfigType,
} from '../configuration/frequency-distribution';
import { VisualizationAggregateValuesRenderer } from '../components/continuous/aggregate';
import {
  VisualizationContinuousDataDistributionConfigForm,
  VisualizationContinuousDataDistributionConfigSchema,
  VisualizationContinuousDataDistributionConfigType,
} from '../configuration/continuous-data-distribution';
import { useVisualizationValuesDataProvider } from '../data-provider/values';
import { VisualizationContinuousDataDistributionRenderer } from '../components/continuous/continuous-data-distribution';
import VisualizationCalendarComponent from '../components/temporal/calendar';
import {
  useVisualizationGeographicalAggregateValuesDataProvider,
  useVisualizationGeographicalFrequenciesDataProvider,
} from '../data-provider/geographical';
import {
  VisualizationGeographicalAggregateValuesConfigForm,
  VisualizationGeographicalAggregateValuesConfigSchema,
  VisualizationGeographicalAggregateValuesConfigType,
  VisualizationGeographicalFrequenciesConfigForm,
  VisualizationGeographicalFrequenciesConfigSchema,
  VisualizationGeographicalFrequenciesConfigType,
} from '../configuration/geographical-points';
import { useVisualizationWordFrequenciesDataProvider } from '../data-provider/word-frequencies';
import { VisualizationWordFrequencyComponent } from '../components/textual/frequency';
import { VisualizationTopicWordsComponent } from '../components/textual/topic-words';
import { useVisualizationTopicWordsDataProvider } from '../data-provider/topic-words';
import { TopicModel } from '@/api/topic';
import { VisualizationCompareSubdatasetWords } from '../components/textual/compare-subdataset-words';
import { useVisualizationCompareSubdatasetWordsDataProvider } from '../data-provider/compare-subdataset-words';
import {
  VisualizationContingencyTableConfigForm,
  VisualizationContingencyTableConfigSchema,
  VisualizationContingencyTableConfigType,
} from '../configuration/contingency-table';
import { useVisualizationContingencyTableDataProvider } from '../data-provider/contingency-table';
import { VisualizationContingencyTableHeatmap } from '../components/correlation/contingency-table';
import {
  VisualizationBinaryStatisticTestOnContingencyTableMainModel,
  VisualizationBinaryStatisticTestOnDistributionMainModel,
  VisualizationContingencyTableModel,
} from '@/api/correlation';
import VisualizationBinaryStatisticTestOnDistributionComponent from '../components/correlation/test-distribution';
import {
  useVisualizationBinaryStatisticTestOnContingencyTableDataProvider,
  useVisualizationBinaryStatisticTestOnDistributionDataProvider,
} from '../data-provider/binary-statistic-test';
import {
  VisualizationBinaryStatisticTestOnDistributionConfigSchema,
  VisualizationBinaryStatisticTestonDistributionConfigType,
  VisualizationBinaryStatisticTestOnDistributionConfigForm,
} from '../configuration/test-distribution';
import VisualizationBinaryStatisticTestOnContingencyTableComponent from '../components/correlation/test-contingency-table';
import {
  VisualizationBinaryStatisticTestOnContingencyTableConfigForm,
  VisualizationBinaryStatisticTestOnContingencyTableConfigSchema,
} from '../configuration/test-contingency-table';
import VisualizationProportionsComponent from '../components/categorical/proportions';
import {
  VisualizationProportionsConfigForm,
  VisualizationProportionsConfigSchema,
  VisualizationProportionsConfigType,
} from '../configuration/proportions';
import {
  VisualizationGeographicalAggregateValuesMap,
  VisualizationGeographicalFrequencyMap,
} from '../components/geographical/geographical-points';
import {
  VisualizationWeightedWordsConfigForm,
  VisualizationWeightedWordsConfigSchema,
  VisualizationWeightedWordsConfigType,
} from '../configuration/weighted-words';

export const DASHBOARD_ITEM_CONFIGURATION: Record<
  DashboardItemTypeEnum,
  VisualizationConfigEntry<any, any>
> = {
  [DashboardItemTypeEnum.Aggregate]: {
    type: DashboardItemTypeEnum.Aggregate,
    label: 'Aggregate Continuous Data',
    description:
      'Show how the data of this column can be grouped by other data in the dataset (e.g.: grouped by topics or categories).',
    component: VisualizationAggregateValuesRenderer,
    dataProvider: useVisualizationAggregatedTotalsDataProvider,
    configForm: VisualizationAggregateValuesConfigForm,
    configValidator: VisualizationAggregateValuesConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationAggregateValuesModel,
    VisualizationAggregateValuesConfigType
  >,
  [DashboardItemTypeEnum.Calendar]: {
    type: DashboardItemTypeEnum.Calendar,
    label: 'Calendar',
    description: 'Show the frequency of rows per date.',
    component: VisualizationCalendarComponent,
    dataProvider: useVisualizationValuesDataProvider,
    configForm: null,
    configValidator: null,
  } as VisualizationConfigEntry<string[], object>,
  [DashboardItemTypeEnum.ContingencyTable]: {
    type: DashboardItemTypeEnum.ContingencyTable,
    label: 'Contingency Table',
    description:
      'Show the joint frequencies of two different columns as a heatmap. For example, you might be interested in seeing what other categories occur frequently with the topic. You can also see how much the frequency deviates from expectations to identify abnormalities or outliers in the dataset.',
    component: VisualizationContingencyTableHeatmap,
    dataProvider: useVisualizationContingencyTableDataProvider,
    configForm: VisualizationContingencyTableConfigForm,
    configValidator: VisualizationContingencyTableConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationContingencyTableModel,
    VisualizationContingencyTableConfigType
  >,
  [DashboardItemTypeEnum.Counts]: {
    type: DashboardItemTypeEnum.Counts,
    label: 'Counts',
    description: 'Show the counts of the valid and invalid data in the column.',
    component: VisualizationColumnCountsRingChart,
    dataProvider: useVisualizationColumnCountsDataProvider,
    configForm: null,
    configValidator: null,
  } as VisualizationConfigEntry<VisualizationColumnCountsModel, object>,
  [DashboardItemTypeEnum.DataDistribution]: {
    type: DashboardItemTypeEnum.DataDistribution,
    label: 'Data Distribution',
    description: 'Show the distribution of the continuous data in this column.',
    component: VisualizationContinuousDataDistributionRenderer,
    dataProvider: useVisualizationValuesDataProvider,
    configForm: VisualizationContinuousDataDistributionConfigForm,
    configValidator: VisualizationContinuousDataDistributionConfigSchema,
  } as VisualizationConfigEntry<
    number[],
    VisualizationContinuousDataDistributionConfigType
  >,
  [DashboardItemTypeEnum.DescriptiveStatistics]: {
    type: DashboardItemTypeEnum.DescriptiveStatistics,
    label: 'Descriptive Statistics',
    description:
      'Show the descriptive statistics of the data in this column, such as its mean, standard deviation, and other statistics.',
    component: DescriptiveStatisticsTableComponent,
    dataProvider: useVisualizationDescriptiveStatisticsDataProvider,
    configForm: null,
    configValidator: null,
  } as VisualizationConfigEntry<DescriptiveStatisticsModel, object>,
  [DashboardItemTypeEnum.FrequencyDistribution]: {
    type: DashboardItemTypeEnum.FrequencyDistribution,
    label: 'Frequency Distribution',
    description:
      'Show the frequency distribution of the discrete data in this column.',
    component: VisualizationFrequencyDistributionRenderer,
    dataProvider: useVisualizationFrequencyDistributionDataProvider,
    configForm: VisualizationFrequencyDistributionConfigForm,
    configValidator: VisualizationFrequencyDistributionConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationFrequencyDistributionModel,
    VisualizationFrequencyDistributionConfigType
  >,
  [DashboardItemTypeEnum.Proportions]: {
    type: DashboardItemTypeEnum.Proportions,
    label: 'Proportions',
    description:
      'Show how each subdataset contributes to the frequency distribution of the discrete data in this column. For accurate visualization purposes, the user is expected to ensure that the subdataset are mutually exclusive.',
    component: VisualizationProportionsComponent,
    dataProvider: useVisualizationFrequencyDistributionDataProvider,
    configForm: VisualizationProportionsConfigForm,
    configValidator: VisualizationProportionsConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationFrequencyDistributionModel,
    VisualizationProportionsConfigType
  >,
  [DashboardItemTypeEnum.GeographicalFrequencies]: {
    type: DashboardItemTypeEnum.GeographicalFrequencies,
    label: 'Frequency Distribution on Map',
    description:
      'Show the locations indicated by the coordinates of this column (and another column as the longitude column) as a map. Locations that have a lot of rows associated with it will have a brighter color.',
    component: VisualizationGeographicalFrequencyMap,
    dataProvider: useVisualizationGeographicalFrequenciesDataProvider,
    configForm: VisualizationGeographicalFrequenciesConfigForm,
    configValidator: VisualizationGeographicalFrequenciesConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalFrequenciesConfigType
  >,
  [DashboardItemTypeEnum.GeographicalAggregate]: {
    type: DashboardItemTypeEnum.GeographicalAggregate,
    label: 'Continuous Data Distribution on Map',
    description:
      'Show the location indicated by the coordinates of this column (and another column as the longitude column) as a map. Locations with a greater continuous data value associated with it will have a brighter color.',
    component: VisualizationGeographicalAggregateValuesMap,
    dataProvider: useVisualizationGeographicalAggregateValuesDataProvider,
    configForm: VisualizationGeographicalAggregateValuesConfigForm,
    configValidator: VisualizationGeographicalAggregateValuesConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationGeographicalPointsModel,
    VisualizationGeographicalAggregateValuesConfigType
  >,
  [DashboardItemTypeEnum.BinaryStatisticTestOnContingencyTable]: {
    type: DashboardItemTypeEnum.BinaryStatisticTestOnContingencyTable,
    label: 'Statistical Test on Contingency Table',
    description:
      'Perform a statistic test between the two columns containing discrete data (wherein each "item" is considered a binary variable) to figure out the correlation of each pair of categories/values between both columns.',
    component: VisualizationBinaryStatisticTestOnContingencyTableComponent,
    dataProvider:
      useVisualizationBinaryStatisticTestOnContingencyTableDataProvider,
    configForm: VisualizationBinaryStatisticTestOnContingencyTableConfigForm,
    configValidator:
      VisualizationBinaryStatisticTestOnContingencyTableConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationBinaryStatisticTestOnContingencyTableMainModel,
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
  [DashboardItemTypeEnum.BinaryStatisticTestOnDistribution]: {
    type: DashboardItemTypeEnum.BinaryStatisticTestOnDistribution,
    label: 'Statistical Test on Distribution',
    description:
      'Perform a statistic test using the subdatasets (wherein each subdataset is considered as a binary variable: all rows in the subdataset, and all rows outside of the subdataset) to figure out its impact on the data distribution of this column.',
    component: VisualizationBinaryStatisticTestOnDistributionComponent,
    dataProvider: useVisualizationBinaryStatisticTestOnDistributionDataProvider,
    configForm: VisualizationBinaryStatisticTestOnDistributionConfigForm,
    configValidator: VisualizationBinaryStatisticTestOnDistributionConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationBinaryStatisticTestOnDistributionMainModel,
    VisualizationBinaryStatisticTestonDistributionConfigType
  >,
  [DashboardItemTypeEnum.SubdatasetWords]: {
    type: DashboardItemTypeEnum.SubdatasetWords,
    label: 'Compare Subdataset Words',
    description:
      'Show the most significant words (according to their c-TF-IDF scores) in the subdatasets. Each subdataset is considered as a topic. For best results, the subdatasets should be mutually exclusive.',
    component: VisualizationCompareSubdatasetWords,
    dataProvider: useVisualizationCompareSubdatasetWordsDataProvider,
    configForm: VisualizationWeightedWordsConfigForm,
    configValidator: VisualizationWeightedWordsConfigSchema,
  } as VisualizationConfigEntry<
    TopicModel,
    VisualizationWeightedWordsConfigType
  >,
  [DashboardItemTypeEnum.TopicWords]: {
    type: DashboardItemTypeEnum.TopicWords,
    label: 'Topic Words',
    description:
      'Show the topic words for each subdataset. The significance (c-TF-IDF score) of the topic words has been adjusted according to the words that appear in the subdataset, so you can treat this as class-based and/or dynamic topic modeling. For example: a topic about hotel services may have different words to describe said topic in the 1990s and in the 2020s (e.g.: the word "wifi" is not likely to appear in the 1990s).',
    component: VisualizationTopicWordsComponent,
    dataProvider: useVisualizationTopicWordsDataProvider,
    configForm: VisualizationWeightedWordsConfigForm,
    configValidator: VisualizationWeightedWordsConfigSchema,
  } as VisualizationConfigEntry<
    TopicModel[],
    VisualizationWeightedWordsConfigType
  >,
  [DashboardItemTypeEnum.WordFrequencies]: {
    type: DashboardItemTypeEnum.WordFrequencies,
    label: 'Word Frequencies',
    description:
      'Show the most frequent words (from the preprocessed documents) of each subdataset.',
    component: VisualizationWordFrequencyComponent,
    dataProvider: useVisualizationWordFrequenciesDataProvider,
    configForm: VisualizationWeightedWordsConfigForm,
    configValidator: VisualizationWeightedWordsConfigSchema,
  } as VisualizationConfigEntry<
    VisualizationTableWordFrequenciesModel,
    VisualizationWeightedWordsConfigType
  >,
};
