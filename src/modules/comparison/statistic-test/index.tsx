import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { Divider, Modal, Title } from '@mantine/core';
import React from 'react';
import { Form } from 'react-hook-form';
import { NamedFiltersContext } from '../context';
import { ComparisonStatisticTestInput } from '@/api/table';
import StatisticTestForm from './form';
import StatisticTestResultRenderer from './result';

function StatisticTestModalBody() {
  const [input, setInput] = React.useState<ComparisonStatisticTestInput | null>(
    null,
  );
  return (
    <>
      <StatisticTestForm setInput={setInput} />
      {input && (
        <>
          <Divider />
          <Title order={3}>Result</Title>
          <StatisticTestResultRenderer input={input} />
        </>
      )}
    </>
  );
}

const StatisticTestModal = React.forwardRef<DisclosureTrigger | null, object>(
  function StatisticTestModal(props, ref) {
    const [opened, { close }] = useDisclosureTrigger(ref);
    return (
      <Modal opened={opened} onClose={close}>
        {opened && (
          <>
            <StatisticTestModalBody />
          </>
        )}
      </Modal>
    );
  },
);

export default StatisticTestModal;
