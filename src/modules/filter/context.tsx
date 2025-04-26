import { TableFilterModel } from '@/api/table';
import { DisclosureTrigger } from '@/hooks/disclosure';
import { Indicator, Button } from '@mantine/core';
import { Funnel } from '@phosphor-icons/react';
import { identity } from 'lodash-es';
import React from 'react';
import TableFilterDrawer from './drawer';

interface TableFilterStateContextType {
  filter: TableFilterModel | null;
  setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
}

export const FilterStateContext =
  React.createContext<TableFilterStateContextType>(null as any);

export function FilterStateProvider(props: React.PropsWithChildren) {
  const [filter, setFilter] = React.useState<TableFilterModel | null>(null);
  return (
    <FilterStateContext.Provider value={{ filter, setFilter }}>
      {props.children}
    </FilterStateContext.Provider>
  );
}

interface TableFilterButtonProps {
  /** If ``state`` is none, the value from ``FilterStateContext`` will be used instead. */
  state: {
    filter: TableFilterModel | null;
    setFilter: React.Dispatch<React.SetStateAction<TableFilterModel | null>>;
  } | null;
}

export function TableFilterButton(props: TableFilterButtonProps) {
  const { state } = props;
  const tableFilterRemote = React.useRef<DisclosureTrigger | null>(null);
  const context = React.useContext(FilterStateContext);
  const filter = state?.filter ?? context?.filter ?? null;
  const setFilter = state?.setFilter ?? context?.setFilter ?? identity;
  return (
    <Indicator disabled={!filter} color="red" zIndex={2}>
      <TableFilterDrawer
        ref={tableFilterRemote}
        filter={filter}
        setFilter={setFilter}
      />
      <Button
        variant="outline"
        onClick={() => {
          tableFilterRemote.current?.open();
        }}
        leftSection={<Funnel />}
      >
        Filter
      </Button>
    </Indicator>
  );
}
