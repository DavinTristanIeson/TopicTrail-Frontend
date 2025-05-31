import { Stack } from '@mantine/core';
import React from 'react';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { StatisticTestResultModel } from '@/api/statistical-analysis';
import {
  GroupCountsRenderer,
  SignificanceAndEffectSizeComponents,
  StatisticTestWarningsRenderer,
} from './common';

export default function StatisticTestResultRenderer(
  props: BaseStatisticalAnalysisResultRendererProps<
    StatisticTestResultModel,
    any
  >,
) {
  const { data, config } = props;
  const warnings = data.warnings;
  return (
    <Stack>
      <StatisticTestWarningsRenderer warnings={warnings} />
      <GroupCountsRenderer column={config.column} groups={data.groups} />
      <SignificanceAndEffectSizeComponents
        effectSize={data.effect_size}
        significance={data.significance}
      />
    </Stack>
  );
}
