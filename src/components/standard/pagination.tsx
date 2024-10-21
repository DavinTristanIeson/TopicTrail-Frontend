import { PaginationMeta } from "@/common/api/model";
import { Pagination as RawPagination, Select } from "@mantine/core";
import React from "react";

interface PaginationSetupProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
}

export function usePaginationSetup() {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(15);
  return { page, setPage, size, setSize };
}

interface UsePaginateDataReturn<T> {
  data: T[];
  from: number;
  to: number;
  meta: PaginationMeta;
  pagination: PaginationSetupProps;
}

export function usePaginateData<T>(data: T[]): UsePaginateDataReturn<T> {
  const pagination = usePaginationSetup();
  const from = (pagination.page - 1) * pagination.size;
  return {
    data: data.slice(from, from + pagination.size),
    from,
    to: from + pagination.size - 1,
    meta: {
      page: pagination.page,
      pages: Math.ceil(data.length / pagination.size),
      size: pagination.size,
      total: data.length,
    },
    pagination,
  };
}

interface PaginationProps extends PaginationSetupProps {
  meta: PaginationMeta;
}

export default function Pagination(props: PaginationProps) {
  return (
    <RawPagination
      total={props.meta.pages}
      value={props.page - 1}
      onChange={props.setPage}
      p={16}
    />
  );
}
