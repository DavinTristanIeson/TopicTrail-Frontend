import {
  EffectSizeMethodEnum,
  GroupEffectSizeMethodEnum,
  GroupStatisticTestMethodEnum,
  SchemaColumnTypeEnum,
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
    value: StatisticTestMethodEnum.ChiSquared,
    description:
      'Use this method if the chosen column contains unordered discrete data (such as categorical data or topic data).',
  },
};

export const GROUP_STATISTIC_TEST_METHOD_DICTIONARY = {
  [GroupStatisticTestMethodEnum.ANOVA]: {
    label: 'One-Way ANOVA F-Test',
    value: GroupStatisticTestMethodEnum.ANOVA,
    description:
      "Use this method if the chosen column contains continuous data and can be assumed to be normally distributed. This test checks if the groups have equal means. If the data doesn't follow a normal distribution, use Kruskal-Wallis H Test instead.",
  },
  [GroupStatisticTestMethodEnum.KruskalWallis]: {
    label: 'Kruskal-Wallis H Test',
    value: GroupStatisticTestMethodEnum.KruskalWallis,
    description:
      'Use this method if the chosen column contains ordered data (such as continuous data, temporal data, or ordered categorical data). This test checks if the groups have equal medians',
  },
  [GroupStatisticTestMethodEnum.ChiSquared]: {
    label: 'Chi-Squared Test',
    value: StatisticTestMethodEnum.ChiSquared,
    description:
      'Use this method if the chosen column contains unordered discrete data (such as categorical data or topic data).',
  },
};

export const EFFECT_SIZE_DICTIONARY = {
  [EffectSizeMethodEnum.CohensD]: {
    label: "Cohen's D",
    value: EffectSizeMethodEnum.CohensD,
    rangeString: `(Inf, Inf)`,
    range: [undefined, undefined],
    description:
      'Measures the difference of means between the two groups relative to their standard deviations. A value of 0.5 means that the means of both groups differ by 0.5 standard deviations.',
  },
  [EffectSizeMethodEnum.MeanDifference]: {
    label: 'Difference of Means',
    rangeString: `(-Inf, Inf)`,
    range: [undefined, undefined],
    value: EffectSizeMethodEnum.MeanDifference,
    description:
      'Measures the difference of means between the two groups. A negative value means the mean of the first group is smaller than the mean of the second group.',
  },
  [EffectSizeMethodEnum.MedianDifference]: {
    label: 'Difference of Medians',
    rangeString: `(-Inf, Inf)`,
    range: [undefined, undefined],
    value: EffectSizeMethodEnum.MedianDifference,
    description:
      'Measures the difference of medians between the two groups. A negative value means the median of the first group is smaller than the median of the second group.',
  },
  [EffectSizeMethodEnum.RankBiserialCorrelation]: {
    label: 'Rank Biserial Correlation',
    rangeString: `[-1, 1]`,
    range: [-1, 1],
    value: EffectSizeMethodEnum.RankBiserialCorrelation,
    description:
      'Measures the difference in ranks between the two groups. A negative number approaching -1 means that the first group has higher ranks than the second group, while a positive number approaching 1 means that the first group has lower ranks than the second group.',
  },
  [EffectSizeMethodEnum.CramerV]: {
    label: "Cramer's V",
    rangeString: `[0, 1]`,
    range: [0, 1],
    value: EffectSizeMethodEnum.CramerV,
    description:
      'Measures the difference of frequency distributions between the two groups. A higher number indicates a greater difference between both groups.',
  },
};

export const GROUP_EFFECT_SIZE_DICTIONARY = {
  [GroupEffectSizeMethodEnum.EtaSquared]: {
    label: 'Eta-Squared',
    value: GroupEffectSizeMethodEnum.EtaSquared,
    rangeString: `[0, Inf)`,
    range: [0, undefined],
    description:
      'Measures how much of the variation in the second column (dependent variable) is explained by the first column (independent variable).',
  },
  [GroupEffectSizeMethodEnum.EpsilonSquared]: {
    label: 'Epsilon-Squared',
    value: GroupEffectSizeMethodEnum.EpsilonSquared,
    rangeString: `(-Inf, Inf)`,
    range: [undefined, undefined],
    description:
      'Measures how much of the variation in the second column (dependent variable) is explained by the first column (independent variable).',
  },
  [EffectSizeMethodEnum.CramerV]: {
    label: "Cramer's V",
    rangeString: `[0, 1]`,
    range: [0, 1],
    value: EffectSizeMethodEnum.CramerV,
    description:
      'Measures how much the values of the first column affects the distribution of the second column. A higher number indicates a greater influence.',
  },
};

const CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS = [
  StatisticTestMethodEnum.ChiSquared,
];
export const STATISTIC_METHOD_CONSTRAINTS: Partial<
  Record<SchemaColumnTypeEnum, StatisticTestMethodEnum[]>
> = {
  [SchemaColumnTypeEnum.Continuous]: [
    StatisticTestMethodEnum.T,
    StatisticTestMethodEnum.MannWhitneyU,
  ],
  [SchemaColumnTypeEnum.Categorical]: CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    StatisticTestMethodEnum.MannWhitneyU,
    StatisticTestMethodEnum.ChiSquared,
  ],
  [SchemaColumnTypeEnum.Temporal]: [StatisticTestMethodEnum.MannWhitneyU],
  [SchemaColumnTypeEnum.Topic]: CATEGORICAL_STATISTIC_METHOD_CONSTRAINTS,
};

const CATEGORICAL_GROUP_STATISTIC_METHOD_CONSTRAINTS = [
  GroupStatisticTestMethodEnum.ChiSquared,
];
export const GROUP_STATISTIC_METHOD_CONSTRAINTS: Partial<
  Record<SchemaColumnTypeEnum, GroupStatisticTestMethodEnum[]>
> = {
  [SchemaColumnTypeEnum.Continuous]: [
    GroupStatisticTestMethodEnum.ANOVA,
    GroupStatisticTestMethodEnum.KruskalWallis,
  ],
  [SchemaColumnTypeEnum.Categorical]:
    CATEGORICAL_GROUP_STATISTIC_METHOD_CONSTRAINTS,
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    GroupStatisticTestMethodEnum.KruskalWallis,
    GroupStatisticTestMethodEnum.ChiSquared,
  ],
  [SchemaColumnTypeEnum.Temporal]: [GroupStatisticTestMethodEnum.KruskalWallis],
  [SchemaColumnTypeEnum.Topic]: CATEGORICAL_GROUP_STATISTIC_METHOD_CONSTRAINTS,
};

const CATEGORICAL_EFFECT_SIZE_CONSTRAINTS = [EffectSizeMethodEnum.CramerV];
export const EFFECT_SIZE_CONSTRAINTS: Partial<
  Record<SchemaColumnTypeEnum, EffectSizeMethodEnum[]>
> = {
  [SchemaColumnTypeEnum.Continuous]: [
    EffectSizeMethodEnum.CohensD,
    EffectSizeMethodEnum.MeanDifference,
    EffectSizeMethodEnum.MedianDifference,
    EffectSizeMethodEnum.RankBiserialCorrelation,
  ],
  [SchemaColumnTypeEnum.Categorical]: CATEGORICAL_EFFECT_SIZE_CONSTRAINTS,
  [SchemaColumnTypeEnum.OrderedCategorical]: [
    EffectSizeMethodEnum.RankBiserialCorrelation,
    EffectSizeMethodEnum.CramerV,
  ],
  [SchemaColumnTypeEnum.Temporal]: [
    EffectSizeMethodEnum.RankBiserialCorrelation,
  ],
  [SchemaColumnTypeEnum.Topic]: CATEGORICAL_EFFECT_SIZE_CONSTRAINTS,
};

export const SUPPORTED_COLUMN_TYPES_FOR_STATISTIC_TEST = Object.keys(
  STATISTIC_METHOD_CONSTRAINTS,
) as SchemaColumnTypeEnum[];
