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
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import { ClockClockwise } from '@phosphor-icons/react/dist/ssr';
import {
  StatisticTestConfig,
  StatisticTestPurpose,
  StatisticTestStateItem,
} from './types';
import { TestTube, Warning } from '@phosphor-icons/react';

interface StatisticTestHistoryProps {
  setPurpose: React.Dispatch<React.SetStateAction<StatisticTestPurpose | null>>;
  setInput: React.Dispatch<React.SetStateAction<StatisticTestConfig | null>>;
}
interface StatisticTestHistoryContextType {
  onApply(entry: StatisticTestStateItem): void;
}

export const StatisticTestHistoryContext =
  React.createContext<StatisticTestHistoryContextType>(null as any);

function StatisticTestHistoryEntryCard(props: StatisticTestStateItem) {
  const { onApply } = React.useContext(StatisticTestHistoryContext);
  const statisticTestConfig = STATISTIC_TEST_CONFIGURATION[props.type];
  const params = statisticTestConfig.getParams(props.config);
  return (
    <Card className="w-full">
      <Group justify="space-between">
        <Text fw="bold" c="brand">
          {statisticTestConfig.label}
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

function StatisticTestHistoryBody() {
  const historyEntries = useComparisonAppState(
    (store) => store.statisticTest.history,
  );
  return (
    <Stack className="w-full">
      {historyEntries.map((historyEntry, idx) => {
        return <StatisticTestHistoryEntryCard {...historyEntry} key={idx} />;
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

const StatisticTestHistory = React.forwardRef<
  DisclosureTrigger | null,
  StatisticTestHistoryProps
>(function StatisticTestHistory(props, ref) {
  const { setPurpose, setInput } = props;
  const [opened, { close: onClose }] = useDisclosureTrigger(ref);
  const setCurrentInput = useComparisonAppState(
    (store) => store.statisticTest.setInput,
  );
  const onApply = React.useCallback(
    (entry: StatisticTestStateItem) => {
      setCurrentInput(entry);
      setPurpose(entry.type);
      setInput(entry.config);
      onClose();
    },
    [onClose, setCurrentInput, setInput, setPurpose],
  );
  return (
    <Drawer
      title="Statistic Test History"
      onClose={onClose}
      opened={opened}
      size="xl"
    >
      <StatisticTestHistoryContext.Provider value={{ onApply }}>
        {opened && <StatisticTestHistoryBody />}
      </StatisticTestHistoryContext.Provider>
    </Drawer>
  );
});

export default StatisticTestHistory;

export function StatisticTestHistoryButton(props: StatisticTestHistoryProps) {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <StatisticTestHistory {...props} ref={remote} />
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
