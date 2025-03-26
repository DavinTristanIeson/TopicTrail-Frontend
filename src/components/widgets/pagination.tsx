import { PaginationMetaModel } from '@/api/table';
import { Group, Pagination, Select, Text } from '@mantine/core';

interface TablePaginatorProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  meta: PaginationMetaModel;
}

export default function TablePagination(props: TablePaginatorProps) {
  const { meta, page, limit, setPage, setLimit } = props;

  return (
    <Group justify="space-between" align="end">
      <Text c="gray">{`Showing ${meta.total <= 0 ? 0 : page * limit + 1} - ${Math.min(meta.total, (page + 1) * limit)} out of ${meta.total} rows`}</Text>
      <Pagination
        total={meta.pages}
        value={page + 1}
        onChange={(page) => setPage(page - 1)}
        hideWithOnePage
      />
      <Group>
        <Text c="gray" size="sm">
          Rows per page
        </Text>
        <Select
          value={limit.toString()}
          onChange={(value) => setLimit(value == null ? 25 : parseInt(value))}
          allowDeselect={false}
          data={[15, 25, 50, 100].map(String)}
          maw={80}
        />
      </Group>
    </Group>
  );
}
