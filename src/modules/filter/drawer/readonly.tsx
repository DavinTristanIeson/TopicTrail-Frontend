import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { TableFilterDrawerFormBody } from '.';
import { TableFilterModel } from '@/api/table';
import React from 'react';
import { useForm } from 'react-hook-form';
import FormWrapper from '@/components/utility/form/wrapper';
import { identity } from 'lodash-es';
import { Drawer } from '@mantine/core';
import { FormEditableContext } from '@/components/standard/fields/context';

interface TableFilterDrawerFormProps {
  filter: TableFilterModel;
  onClose(): void;
}

function ReadonlyFilterDrawerForm(props: TableFilterDrawerFormProps) {
  const { filter, onClose } = props;

  const form = useForm({
    mode: 'onChange',
    defaultValues: filter as any,
  });

  return (
    <FormWrapper form={form} onSubmit={identity}>
      <TableFilterDrawerFormBody
        name=""
        close={onClose}
        setFilter={() => {}}
        canReset={false}
      />
    </FormWrapper>
  );
}

const ReadonlyFilterDrawer = React.forwardRef<
  ParametrizedDisclosureTrigger<{
    name: string;
    filter: TableFilterModel;
  }> | null,
  object
>(function TableFilterDrawer(props, ref) {
  const [filter, { close: onClose }] = useParametrizedDisclosureTrigger(ref);

  return (
    <Drawer
      title={filter?.name ?? 'View Filter'}
      opened={!!filter}
      onClose={onClose}
      closeOnClickOutside
      closeOnEscape
      size="xl"
    >
      <FormEditableContext.Provider
        value={React.useMemo(() => {
          return {
            editable: false,
            setEditable() {},
          };
        }, [])}
      >
        {!!filter && (
          <ReadonlyFilterDrawerForm filter={filter.filter} onClose={onClose} />
        )}
      </FormEditableContext.Provider>
    </Drawer>
  );
});

export default ReadonlyFilterDrawer;
