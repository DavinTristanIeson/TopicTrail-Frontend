import { Alert, Divider, Select, Stack } from '@mantine/core';
import React from 'react';
import { Warning } from '@phosphor-icons/react';
import { useComparisonAppState } from '../comparison/app-state';
import { StatisticTestPurpose } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import StatisticTestForm from './configuration';
import StatisticTestResultRenderer from './components';

interface StatisticTestSwitcherProps {
  purpose: StatisticTestPurpose;
}

function StatisticTestSwitcher(props: StatisticTestSwitcherProps) {
  const { purpose } = props;
  const statisticTestConfig = STATISTIC_TEST_CONFIGURATION[purpose];
  if (!statisticTestConfig) return null;
  return (
    <>
      <StatisticTestForm purpose={purpose} />
      <Divider />
      <StatisticTestResultRenderer purpose={purpose} />
    </>
  );
}

export default function StatisticTestPage() {
  const current = useComparisonAppState((store) => store.statisticTest.current);
  const [purpose, setPurpose] = React.useState(
    current?.type ?? StatisticTestPurpose.TwoSample,
  );
  const renderOption = useDescriptionBasedRenderOption(
    STATISTIC_TEST_CONFIGURATION,
  );
  return (
    <Stack>
      <Select
        value={purpose}
        onChange={
          setPurpose as React.Dispatch<React.SetStateAction<string | null>>
        }
        data={Object.values(STATISTIC_TEST_CONFIGURATION).map((config) => {
          return {
            label: config.label,
            value: config.type,
          };
        })}
        label="Type"
        description="What kind of statistic test would you like to perform?"
        required
        allowDeselect={false}
        renderOption={renderOption}
      />
      <Alert color="yellow" icon={<Warning />}>
        Please make sure that all of your subdatasets are mutually exclusive.
        Statistical tests may produce unreliable results if there are
        overlapping data samples.
      </Alert>
      <StatisticTestSwitcher purpose={purpose} />
    </Stack>
  );
}
