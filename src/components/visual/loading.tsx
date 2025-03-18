import { SimpleGrid, Skeleton } from '@mantine/core';

export function ListSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton height={60} key={i} />
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
