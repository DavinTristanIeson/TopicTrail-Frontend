import { SimpleGrid, Skeleton } from '@mantine/core';

interface ListSkeletonProps {
  count?: number;
  height?: number;
}

export function ListSkeleton(props: ListSkeletonProps) {
  const { count = 10, height = 60 } = props;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton height={height} key={i} />
      ))}
    </>
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
