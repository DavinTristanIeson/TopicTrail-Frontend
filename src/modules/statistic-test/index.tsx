import { Alert, Divider, Group, Select, Stack } from '@mantine/core';
import React from 'react';
import { Warning } from '@phosphor-icons/react';
import { useComparisonAppState } from '../comparison/app-state';
import { StatisticTestConfig, StatisticTestPurpose } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import StatisticTestForm from './configuration';
import StatisticTestResultRenderer from './components';
import { StatisticTestHistoryButton } from './history';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

interface StatisticTestSwitcherProps {
  purpose: StatisticTestPurpose;
  input: StatisticTestConfig | null | undefined;
  setInput: (config: StatisticTestConfig) => void;
}

function StatisticTestSwitcher(props: StatisticTestSwitcherProps) {
  const { purpose, input, setInput } = props;
  const statisticTestConfig = STATISTIC_TEST_CONFIGURATION[purpose];
  const setStatisticTestHistoryEntry = useComparisonAppState(
    (store) => store.statisticTest.setInput,
  );
  const onSubmit = React.useCallback(
    (config: StatisticTestConfig) => {
      setStatisticTestHistoryEntry({
        type: purpose,
        config,
      });
      setInput(config);
    },
    [purpose, setInput, setStatisticTestHistoryEntry],
  );

  if (!statisticTestConfig) return null;
  return (
    <>
      <DefaultErrorViewBoundary>
        <StatisticTestForm
          purpose={purpose}
          onSubmit={onSubmit}
          defaultValues={input}
          key={JSON.stringify(input)}
        />
      </DefaultErrorViewBoundary>
      {input && (
        <>
          <Divider />
          <DefaultErrorViewBoundary>
            <StatisticTestResultRenderer purpose={purpose} input={input} />
          </DefaultErrorViewBoundary>
        </>
      )}
    </>
  );
}

interface StatisticTestSelectPurposeProps {
  purpose: StatisticTestPurpose | null;
  setPurpose: React.Dispatch<React.SetStateAction<StatisticTestPurpose | null>>;
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
      miw={512}
      label="Type"
      description="What kind of statistic test would you like to perform?"
      required
      allowDeselect={false}
      renderOption={renderOption}
    />
  );
}

export default function StatisticTestPage() {
  const recentInput = useComparisonAppState(
    (store) => store.statisticTest.input,
  );
  const [purpose, setPurpose] = React.useState<StatisticTestPurpose | null>(
    recentInput?.type ?? StatisticTestPurpose.TwoSample,
  );
  const [input, setInput] = React.useState<StatisticTestConfig | null>(
    recentInput?.config ?? null,
  );

  return (
    <Stack>
      <Group justify="space-between" align="start">
        <StatisticTestSelectPurpose
          purpose={purpose}
          setPurpose={(value) => {
            setPurpose(value);
            setInput(null);
          }}
        />
        <div className="pt-6">
          <StatisticTestHistoryButton
            setPurpose={setPurpose}
            setInput={setInput}
          />
        </div>
      </Group>
      <Alert color="yellow" icon={<Warning />}>
        Please make sure that all of your subdatasets are mutually exclusive.
        Statistical tests may produce unreliable results if there are
        overlapping data samples.
      </Alert>
      {purpose && (
        <StatisticTestSwitcher
          purpose={purpose}
          input={input}
          setInput={setInput}
          key={purpose}
        />
      )}
    </Stack>
  );
}
