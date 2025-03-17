import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { Alert, Modal } from '@mantine/core';
import { Info } from '@phosphor-icons/react';
import React from 'react';
import {
  LoadFilterActionComponent,
  SaveFilterActionComponent,
} from './actions';
import { TableFilterModel } from '@/api/table';

interface TableFilterManagementModalProps {
  setFilter(filter: TableFilterModel): void;
}

const TableFilterManagementModal = React.forwardRef<
  ParametrizedDisclosureTrigger<TableFilterModel> | null,
  TableFilterManagementModalProps
>(function TableFilterManagementModal(props, ref) {
  const { setFilter } = props;
  const [filter, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Modal title="Manage Filters" onClose={close} opened={!!filter}>
      <Alert
        color="blue"
        icon={<Info size={20} />}
        title="What is the purpose of this menu?"
      >
        If there are filters that are often used in your analysis, you can
        create a named filter so that you can load it easily later.
      </Alert>
      {filter && (
        <>
          <SaveFilterActionComponent
            filter={filter}
            setFilter={setFilter}
            onClose={close}
          />
          <LoadFilterActionComponent
            filter={filter}
            setFilter={setFilter}
            onClose={close}
          />
        </>
      )}
    </Modal>
  );
});

export default TableFilterManagementModal;
