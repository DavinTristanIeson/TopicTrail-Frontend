import { QueryClient } from '@tanstack/react-query';

import { ExtendedApiResult } from './model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getNextPageParam(lastPage: ExtendedApiResult<any[]>) {
  return lastPage.page < lastPage.pages
    ? lastPage.page + 1
    : undefined;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
