import { TableFilterModel } from '@/api/table';
import { ErrorAlert } from '@/components/standard/fields/watcher';
import FormWrapper from '@/components/utility/form/wrapper';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import { TableFilterDrawerFormBody } from '@/modules/filter/drawer';
import {
  TableFilterFormType,
  defaultTableFilterFormValues,
} from '@/modules/filter/drawer/form-type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Drawer } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  comparisonFilterFormSchema,
  ComparisonFilterFormType,
} from './form-type';
import { useCheckFilterValidity } from '@/modules/filter/management/hooks';
import { NamedFiltersContext } from '../context';
import RHFField from '@/components/standard/fields';
import { NamedTableFilterModel } from '@/api/comparison';

interface ComparisonFilterDrawerContentsProps {
  appliedFilter: NamedTableFilterModel;
  onClose(): void;
}

function ComparisonFilterDrawerContents(
  props: ComparisonFilterDrawerContentsProps,
) {
  const { appliedFilter, onClose } = props;
  const { filters: appliedFilters, setFilters: setAppliedFilters } =
    React.useContext(NamedFiltersContext);

  const uniqueFilterNames = React.useMemo(() => {
    return appliedFilters.map((filter) => filter.name);
  }, [appliedFilters]);

  const defaultValues = React.useMemo(() => {
    const defaultComparisonFilterValues: ComparisonFilterFormType = {
      name: `Group ${appliedFilters.length + 1}`,
      filter: defaultTableFilterFormValues,
    };
    return (
      (appliedFilter as ComparisonFilterFormType | undefined) ??
      defaultComparisonFilterValues
    );
  }, [appliedFilter, appliedFilters.length]);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(comparisonFilterFormSchema(uniqueFilterNames)),
    defaultValues,
  });
  const { getValues, reset } = form;

  const checkFilter = useCheckFilterValidity();

  const onSubmit = React.useCallback(
    async (formValues: ComparisonFilterFormType) => {
      if (!appliedFilter) return;
      const payload = comparisonFilterFormSchema(uniqueFilterNames).cast(
        formValues,
        {
          stripUnknown: true,
        },
      ) as NamedTableFilterModel;
      payload.filter = await checkFilter(payload.filter);

      setAppliedFilters((prev) => {
        const next = prev.slice();
        const index = next.findIndex(
          (item) => item.name === appliedFilter.name,
        );
        if (index === -1) {
          next.push(payload);
        } else {
          next[index] = payload;
        }
        return next;
      });
      onClose();
      showNotification({
        message: 'Filter has been updated successfully',
        color: 'green',
      });
    },
    [appliedFilter, checkFilter, onClose, setAppliedFilters, uniqueFilterNames],
  );

  const loadFilter = React.useCallback(
    (filter: TableFilterModel | null) => {
      reset({
        name: getValues('name'),
        filter: filter as TableFilterFormType,
      });
    },
    [getValues, reset],
  );

  return (
    <FormWrapper form={form} onSubmit={onSubmit}>
      <ErrorAlert />
      <TableFilterDrawerFormBody
        name="filter"
        close={close}
        setFilter={loadFilter}
        AboveForm={
          <div className="pb-3">
            <RHFField
              type="text"
              name="name"
              label="Group Name"
              required
              description="Group name should be unique."
            />
          </div>
        }
      />
    </FormWrapper>
  );
}

const ComparisonFilterDrawer = React.forwardRef<
  ParametrizedDisclosureTrigger<NamedTableFilterModel> | null,
  object
>(function TableFilterDrawer(props, ref) {
  const [appliedFilter, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Drawer
      title="Filter"
      opened={appliedFilter != null}
      onClose={close}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {appliedFilter && (
        <ComparisonFilterDrawerContents
          appliedFilter={appliedFilter}
          onClose={close}
        />
      )}
    </Drawer>
  );
});

export default ComparisonFilterDrawer;
