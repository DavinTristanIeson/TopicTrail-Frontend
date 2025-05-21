import { Alert, Divider, Group, Select, Stack } from '@mantine/core';
import React from 'react';
import { Warning } from '@phosphor-icons/react';
import { useComparisonAppState } from '../comparison/app-state';
import {
  StatisticTestConfig,
  StatisticTestStateItem,
  StatisticTestPurpose,
} from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import StatisticTestForm from './configuration';
import StatisticTestResultRenderer from './components';
import { StatisticTestHistoryButton } from './history';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

interface StatisticTestSwitcherProps {
  purpose: StatisticTestPurpose;
}

function StatisticTestSwitcher(props: StatisticTestSwitcherProps) {
  const { purpose } = props;
  const statisticTestConfig = STATISTIC_TEST_CONFIGURATION[purpose];
  const currentInput = useComparisonAppState(
    (store) => store.statisticTest.current,
  );
  const setCurrentInput = useComparisonAppState(
    (store) => store.statisticTest.setCurrent,
  );
  const onSubmit = React.useCallback(
    (config: StatisticTestConfig) => {
      const input: StatisticTestStateItem = {
        type: purpose,
        config,
      };
      setCurrentInput(input);
    },
    [purpose, setCurrentInput],
  );

  if (!statisticTestConfig) return null;
  return (
    <>
      <DefaultErrorViewBoundary>
        <StatisticTestForm
          purpose={purpose}
          onSubmit={onSubmit}
          defaultValues={currentInput?.config}
        />
      </DefaultErrorViewBoundary>
      {currentInput && (
        <>
          <Divider />
          <DefaultErrorViewBoundary>
            <StatisticTestResultRenderer
              purpose={purpose}
              input={currentInput}
            />
          </DefaultErrorViewBoundary>
        </>
      )}
    </>
  );
}

interface StatisticTestSelectPurposeProps {
  purpose: StatisticTestPurpose;
  setPurpose: React.Dispatch<React.SetStateAction<StatisticTestPurpose>>;
}

function StatisticTestSelectPurpose(props: StatisticTestSelectPurposeProps) {
  const { purpose, setPurpose } = props;
  const renderOption = useDescriptionBasedRenderOption(
    STATISTIC_TEST_CONFIGURATION,
  );
  return (
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
  );
}

export default function StatisticTestPage() {
  const current = useComparisonAppState((store) => store.statisticTest.current);
  const [purpose, setPurpose] = React.useState(
    current?.type ?? StatisticTestPurpose.TwoSample,
  );

  return (
    <Stack>
      <Group justify="space-between" align="end">
        <StatisticTestSelectPurpose purpose={purpose} setPurpose={setPurpose} />
        <StatisticTestHistoryButton />
      </Group>
      <Alert color="yellow" icon={<Warning />}>
        Please make sure that all of your subdatasets are mutually exclusive.
        Statistical tests may produce unreliable results if there are
        overlapping data samples.
      </Alert>
      <StatisticTestSwitcher purpose={purpose} />
    </Stack>
  );
}
