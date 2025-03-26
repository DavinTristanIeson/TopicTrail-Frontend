import { TableSortModel } from '@/api/table';
import { ActionIcon } from '@mantine/core';
import { ArrowsDownUp, CaretDown, CaretUp } from '@phosphor-icons/react';
import React from 'react';

interface UseTableSortStateProps {
  sort: TableSortModel | null;
  setSort: React.Dispatch<React.SetStateAction<TableSortModel | null>>;
  column: string;
}

interface UseTableSortStateReturn
  extends Omit<UseTableSortStateProps, 'column'> {
  isSorted: boolean;
  handleSort(): void;
}

export default function useTableSortState(
  props: UseTableSortStateProps,
): UseTableSortStateReturn {
  const { sort, setSort, column } = props;
  const handleSort = React.useCallback(() => {
    setSort((prev) => {
      if (prev == null || prev.name !== column) {
        return { asc: true, name: column };
      } else if (prev.asc) {
        return { asc: false, name: column };
      } else {
        return null;
      }
    });
  }, [column, setSort]);
  return {
    sort,
    setSort,
    handleSort,
    isSorted: !!sort && sort.name === column,
  };
}

export function TableSortActionIcon(props: UseTableSortStateProps) {
  const { handleSort, isSorted, sort } = useTableSortState(props);
  return (
    <ActionIcon onClick={handleSort} variant="subtle">
      {!isSorted ? <ArrowsDownUp /> : sort?.asc ? <CaretUp /> : <CaretDown />}
    </ActionIcon>
  );
}
