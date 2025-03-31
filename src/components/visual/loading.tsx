import { SimpleGrid, Skeleton, Stack } from '@mantine/core';

interface ListSkeletonProps {
  count?: number;
  height?: number;
}

export function ListSkeleton(props: ListSkeletonProps) {
  const { count = 10, height = 60 } = props;
  return (
    <Stack>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton height={height} key={i} />
      ))}
    </Stack>
  );
}

export function GridSkeleton() {
  return (
    <SimpleGrid className="w-full" cols={3}>
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton height={180} key={i} />
      ))}
    </SimpleGrid>
  );
}

export function TableSkeleton() {
  return (
    <SimpleGrid className="w-full" cols={6} spacing="xs">
      {Array.from({ length: 42 }, (_, i) => (
        <Skeleton height={40} key={i} radius={0} />
      ))}
    </SimpleGrid>
  );
}
