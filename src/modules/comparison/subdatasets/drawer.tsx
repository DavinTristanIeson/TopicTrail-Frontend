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
import RHFField from '@/components/standard/fields';
import { ComparisonStateItemModel } from '@/api/comparison';
import {
  useCheckComparisonSubdatasetsVisibility,
  useComparisonAppState,
} from '../app-state';

interface ComparisonFilterDrawerContentsProps {
  appliedGroup: ComparisonStateItemModel;
  onClose(): void;
}

function ComparisonFilterDrawerContents(
  props: ComparisonFilterDrawerContentsProps,
) {
  const { appliedGroup: appliedGroup, onClose } = props;

  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroup = useComparisonAppState(
    (store) => store.groups.handlers.setItem,
  );
  const addComparisonGroup = useComparisonAppState(
    (store) => store.groups.handlers.append,
  );
  const { setVisibility } = useCheckComparisonSubdatasetsVisibility();

  const currentComparisonGroupIndex = React.useMemo(() => {
    const index = comparisonGroups.findIndex(
      (group) => group.name === appliedGroup.name,
    );
    if (index === -1) {
      return null;
    } else {
      return index;
    }
  }, [appliedGroup.name, comparisonGroups]);

  const defaultValues = React.useMemo(() => {
    const defaultComparisonFilterValues: ComparisonFilterFormType = {
      name: `Group ${comparisonGroups.length + 1}`,
      filter: defaultTableFilterFormValues,
    };
    return (
      (appliedGroup as ComparisonFilterFormType | undefined) ??
      defaultComparisonFilterValues
    );
  }, [appliedGroup, comparisonGroups.length]);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(comparisonFilterFormSchema),
    defaultValues,
  });
  const { getValues, reset } = form;

  const checkFilter = useCheckFilterValidity();

  const onSubmit = React.useCallback(
    async (formValues: ComparisonFilterFormType) => {
      if (!appliedGroup) return;
      const payload = comparisonFilterFormSchema.cast(formValues, {
        stripUnknown: true,
      }) as ComparisonStateItemModel;
      payload.filter = await checkFilter(payload.filter);

      if (currentComparisonGroupIndex == null) {
        addComparisonGroup(payload);
      } else {
        setComparisonGroup(currentComparisonGroupIndex, payload);
      }
      setVisibility(payload.name, true);

      onClose();
      showNotification({
        message: 'Filter has been updated successfully',
        color: 'green',
      });
    },
    [
      addComparisonGroup,
      appliedGroup,
      checkFilter,
      currentComparisonGroupIndex,
      onClose,
      setComparisonGroup,
      setVisibility,
    ],
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
        close={onClose}
        setFilter={loadFilter}
        AboveForm={
          <div className="pb-3">
            <RHFField
              type="text"
              name="name"
              label="Subdataset Name"
              required
              description="Subdataset name should be unique."
            />
          </div>
        }
      />
    </FormWrapper>
  );
}

const ComparisonFilterDrawer = React.forwardRef<
  ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null,
  object
>(function TableFilterDrawer(props, ref) {
  const [appliedGroup, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Drawer
      title="Edit Subdataset"
      opened={appliedGroup != null}
      onClose={close}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {appliedGroup && (
        <ComparisonFilterDrawerContents
          appliedGroup={appliedGroup}
          onClose={close}
        />
      )}
    </Drawer>
  );
});

export default ComparisonFilterDrawer;
