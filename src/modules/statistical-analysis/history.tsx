import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import {
  Text,
  Card,
  Drawer,
  SimpleGrid,
  Button,
  Group,
  Stack,
  Alert,
} from '@mantine/core';
import React from 'react';
import { useComparisonAppState } from '../comparison/app-state';
import { STATISTICAL_ANALYSIS_CONFIGURATION } from './statistic-test-config';
import { ClockClockwise } from '@phosphor-icons/react/dist/ssr';
import {
  StatisticalAnalysisPurpose,
  StatisticalAnalysisStateItem,
} from './types';
import { TestTube, Warning } from '@phosphor-icons/react';

interface StatisticalAnalysisHistoryProps {
  setPurpose: React.Dispatch<
    React.SetStateAction<StatisticalAnalysisPurpose | null>
  >;
  setInput: React.Dispatch<React.SetStateAction<any | null>>;
}
interface StatisticalAnalysisHistoryContextType {
  onApply(entry: StatisticalAnalysisStateItem): void;
}

export const StatisticalAnalysisHistoryContext =
  React.createContext<StatisticalAnalysisHistoryContextType>(null as any);

function StatisticalAnalysisHistoryEntryCard(
  props: StatisticalAnalysisStateItem,
) {
  const { onApply } = React.useContext(StatisticalAnalysisHistoryContext);
  const statisticalAnalysisConfig =
    STATISTICAL_ANALYSIS_CONFIGURATION[props.type];
  const params = statisticalAnalysisConfig.getParams(props.config);
  return (
    <Card className="w-full">
      <Group justify="space-between">
        <Text fw="bold" c="brand">
          {statisticalAnalysisConfig.label}
        </Text>
        <Button
          leftSection={<TestTube />}
          variant="outline"
          onClick={() => {
            onApply(props);
          }}
        >
          Apply
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 2, lg: 3 }} spacing="xs">
        {Object.entries(params).map(([key, value]) => (
          <Text key={key}>
            <Text inherit span fw={500}>
              {key}:&nbsp;
            </Text>
            <Text inherit span>
              {value}
            </Text>
          </Text>
        ))}
      </SimpleGrid>
    </Card>
  );
}

function StatisticalAnalysisHistoryBody() {
  const historyEntries = useComparisonAppState(
    (store) => store.statisticalAnalysis.history,
  );
  return (
    <Stack className="w-full">
      {historyEntries.map((historyEntry, idx) => {
        return (
          <StatisticalAnalysisHistoryEntryCard {...historyEntry} key={idx} />
        );
      })}
      {historyEntries.length === 0 && (
        <Alert color="yellow" icon={<Warning />}>
          You haven&apos;t performed any statistic tests yet. Any tests that you
          have performed will appear here.
        </Alert>
      )}
    </Stack>
  );
}

const StatisticalAnalysisHistory = React.forwardRef<
  DisclosureTrigger | null,
  StatisticalAnalysisHistoryProps
>(function StatisticTestHistory(props, ref) {
  const { setPurpose, setInput } = props;
  const [opened, { close: onClose }] = useDisclosureTrigger(ref);
  const setCurrentInput = useComparisonAppState(
    (store) => store.statisticalAnalysis.setInput,
  );
  const onApply = React.useCallback(
    (entry: StatisticalAnalysisStateItem) => {
      setCurrentInput(entry);
      setPurpose(entry.type);
      setInput(entry.config);
      onClose();
    },
    [onClose, setCurrentInput, setInput, setPurpose],
  );
  return (
    <Drawer
      title="History of Statistical Analysis"
      onClose={onClose}
      opened={opened}
      size="xl"
    >
      <StatisticalAnalysisHistoryContext.Provider value={{ onApply }}>
        {opened && <StatisticalAnalysisHistoryBody />}
      </StatisticalAnalysisHistoryContext.Provider>
    </Drawer>
  );
});

export default StatisticalAnalysisHistory;

export function StatisticalAnalysisHistoryButton(
  props: StatisticalAnalysisHistoryProps,
) {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <StatisticalAnalysisHistory {...props} ref={remote} />
      <Button
        onClick={() => remote.current?.open()}
        leftSection={<ClockClockwise />}
        variant="outline"
      >
        Open History
      </Button>
    </>
  );
}
