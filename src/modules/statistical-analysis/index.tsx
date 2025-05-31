import { Divider, Group, Select, Stack } from '@mantine/core';
import React from 'react';
import { useComparisonAppState } from '../comparison/app-state';
import { StatisticalAnalysisPurpose } from './types';
import { useDescriptionBasedRenderOption } from '@/components/visual/select';
import { STATISTICAL_ANALYSIS_CONFIGURATION } from './statistic-test-config';
import StatisticalAnalysisInputForm from './configuration';
import StatisticalAnalysisResultRenderer from './components';
import { StatisticalAnalysisHistoryButton } from './history';
import { DefaultErrorViewBoundary } from '@/components/visual/error';

interface StatisticalAnalysisSwitcherProps {
  purpose: StatisticalAnalysisPurpose;
  input: any | null | undefined;
  setInput: (config: any) => void;
}

function StatisticalAnalysisSwitcher(props: StatisticalAnalysisSwitcherProps) {
  const { purpose, input, setInput } = props;
  const statisticTestConfig = STATISTICAL_ANALYSIS_CONFIGURATION[purpose];
  const setStatisticTestHistoryEntry = useComparisonAppState(
    (store) => store.statisticalAnalysis.setInput,
  );
  const onSubmit = React.useCallback(
    (config: any) => {
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
        <StatisticalAnalysisInputForm
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
            <StatisticalAnalysisResultRenderer
              purpose={purpose}
              input={input}
            />
          </DefaultErrorViewBoundary>
        </>
      )}
    </>
  );
}

interface StatisticalAnalysisSelectPurposeProps {
  purpose: StatisticalAnalysisPurpose | null;
  setPurpose: React.Dispatch<
    React.SetStateAction<StatisticalAnalysisPurpose | null>
  >;
}

function StatisticalAnalysisSelectPurpose(
  props: StatisticalAnalysisSelectPurposeProps,
) {
  const { purpose, setPurpose } = props;
  const renderOption = useDescriptionBasedRenderOption(
    STATISTICAL_ANALYSIS_CONFIGURATION,
  );
  return (
    <Select
      value={purpose}
      onChange={
        setPurpose as React.Dispatch<React.SetStateAction<string | null>>
      }
      data={Object.values(STATISTICAL_ANALYSIS_CONFIGURATION).map((config) => {
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

export default function StatisticalAnalysisPage() {
  const recentInput = useComparisonAppState(
    (store) => store.statisticalAnalysis.input,
  );
  const [purpose, setPurpose] =
    React.useState<StatisticalAnalysisPurpose | null>(
      recentInput?.type ?? StatisticalAnalysisPurpose.TwoSample,
    );
  const [input, setInput] = React.useState<any | null>(
    recentInput?.config ?? null,
  );

  return (
    <Stack>
      <Group justify="space-between" align="start">
        <StatisticalAnalysisSelectPurpose
          purpose={purpose}
          setPurpose={(value) => {
            setPurpose(value);
            setInput(null);
          }}
        />
        <div className="pt-6">
          <StatisticalAnalysisHistoryButton
            setPurpose={setPurpose}
            setInput={setInput}
          />
        </div>
      </Group>
      {purpose && (
        <StatisticalAnalysisSwitcher
          purpose={purpose}
          input={input}
          setInput={setInput}
          key={purpose}
        />
      )}
    </Stack>
  );
}
