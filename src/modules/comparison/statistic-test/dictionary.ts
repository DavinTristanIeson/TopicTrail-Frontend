import {
  EffectSizeMethodEnum,
  StatisticTestMethodEnum,
} from '@/common/constants/enum';

export const STATISTIC_TEST_METHOD_DICTIONARY = {
  [StatisticTestMethodEnum.T]: {
    label: 'T Test',
    value: StatisticTestMethodEnum.T,
    description:
      "Use this method if the chosen column contains continuous data and can be assumed to be normally distributed. If the data doesn't follow a normal distribution, use Mann-Whitney U Test instead.",
  },
  [StatisticTestMethodEnum.MannWhitneyU]: {
    label: 'Mann-Whitney U Test',
    value: StatisticTestMethodEnum.MannWhitneyU,
    description:
      'Use this method if the chosen column contains ordered data (such as continuous data, temporal data, or ordered categorical data).',
  },
  [StatisticTestMethodEnum.ChiSquared]: {
    label: 'Chi-Squared Test',
    value: StatisticTestMethodEnum.MannWhitneyU,
    description:
      'Use this method if the chosen column contains unordered discrete data (such as categorical data or topic data).',
  },
};

export const EFFECT_SIZE_DICTIONARY = {
  [EffectSizeMethodEnum.CohensD]: {
    label: "Cohen's D",
    value: EffectSizeMethodEnum.CohensD,
    range: [0, Infinity],
    description:
      'Measures the difference of means between the two groups relative to their standard deviations. A value of 0.5 means that the means of both groups differ by 0.5 standard deviations.',
  },
  [EffectSizeMethodEnum.MeanDifference]: {
    label: 'Difference of Means',
    range: [0, Infinity],
    value: EffectSizeMethodEnum.MeanDifference,
    description:
      'Measures the absolute difference of means between the two groups.',
  },
  [EffectSizeMethodEnum.MedianDifference]: {
    label: 'Difference of Medians',
    range: [0, Infinity],
    value: EffectSizeMethodEnum.MedianDifference,
    description:
      'Measures the absolute difference of medians between the two groups.',
  },
  [EffectSizeMethodEnum.RankBiserialCorrelation]: {
    label: 'Rank Biserial Correlation',
    range: [-1, 1],
    value: EffectSizeMethodEnum.RankBiserialCorrelation,
    description:
      'Measures the difference in ranks between the two groups. A negative number approaching -1 means that the first group has higher ranks than the second group, while a positive number approaching 1 means that the first group has lower ranks than the second group.',
  },
  [EffectSizeMethodEnum.CramerV]: {
    label: "Cramer's V",
    range: [0, 1],
    value: EffectSizeMethodEnum.CramerV,
    description:
      'Measures the difference of frequency distributions between the two groups. A higher number indicates a greater difference between both groups.',
  },
};
