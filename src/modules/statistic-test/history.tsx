import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Text, Card, Drawer, List, SimpleGrid, Button } from '@mantine/core';
import React from 'react';
import { useComparisonAppState } from '../comparison/app-state';
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import { ClockClockwise } from '@phosphor-icons/react/dist/ssr';

function StatisticTestHistoryBody() {
  const historyEntries = useComparisonAppState(
    (store) => store.statisticTest.history,
  );
  return (
    <List>
      {historyEntries.map((historyEntry, idx) => {
        const statisticTestConfig =
          STATISTIC_TEST_CONFIGURATION[historyEntry.type];
        const params = statisticTestConfig.getParams(historyEntry.config);
        return (
          <List.Item key={idx}>
            <Card>
              <Text fw="bold" c="brand">
                {statisticTestConfig.label}
              </Text>
              <SimpleGrid cols={{ base: 2, lg: 3 }}>
                {Object.entries(params).map(([key, value]) => (
                  <Text key={key}>
                    <Text inherit span fw={500}>
                      {key}
                    </Text>
                    <Text inherit span>
                      {value}
                    </Text>
                  </Text>
                ))}
              </SimpleGrid>
            </Card>
          </List.Item>
        );
      })}
    </List>
  );
}

const StatisticTestHistory = React.forwardRef<DisclosureTrigger | null, object>(
  function StatisticTestHistory(props, ref) {
    const [opened, { close: onClose }] = useDisclosureTrigger(ref);
    return (
      <Drawer
        title="Statistic Test History"
        onClose={onClose}
        opened={opened}
        size="xl"
      >
        {opened && <StatisticTestHistoryBody />}
      </Drawer>
    );
  },
);

export default StatisticTestHistory;

export function StatisticTestHistoryButton() {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <StatisticTestHistory ref={remote} />
      <Button
        onClick={() => remote.current?.open()}
        leftSection={<ClockClockwise />}
      >
        Open History
      </Button>
    </>
  );
}
