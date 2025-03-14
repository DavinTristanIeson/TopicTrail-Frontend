import { QueryClient } from '@tanstack/react-query';

import { ExtendedApiResult } from './model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getNextPageParam(lastPage: ExtendedApiResult<any[]>) {
  return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Since our application is only controlled by the interface, we can safely assume these long stale/cache times as the interface controls when the state
      // is mutated.
      staleTime: 15 * 60 * 1000,
      // Try not to keep too many useless data
      gcTime: 2 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
