import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import {
  Text,
  Card,
  Drawer,
  List,
  SimpleGrid,
  Button,
  Group,
} from '@mantine/core';
import React from 'react';
import { useComparisonAppState } from '../comparison/app-state';
import { STATISTIC_TEST_CONFIGURATION } from './statistic-test-config';
import { ClockClockwise } from '@phosphor-icons/react/dist/ssr';
import { StatisticTestStateItem } from './types';
import { TestTube } from '@phosphor-icons/react';

function StatisticTestHistoryEntryCard(props: StatisticTestStateItem) {
  const statisticTestConfig = STATISTIC_TEST_CONFIGURATION[props.type];
  const params = statisticTestConfig.getParams(props.config);
  const setCurrentInput = useComparisonAppState(
    (store) => store.statisticTest.setCurrent,
  );
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
            setCurrentInput(props);
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
    <List className="w-full">
      {historyEntries.map((historyEntry, idx) => {
        return (
          <List.Item key={idx} className="w-full">
            <StatisticTestHistoryEntryCard {...historyEntry} />
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
        variant="outline"
      >
        Open History
      </Button>
    </>
  );
}
