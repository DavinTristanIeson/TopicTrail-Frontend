import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Since our application is only controlled by the interface, we can safely assume these long stale/cache times as the interface controls when the state
      // is mutated.
      staleTime: 15 * 60 * 1000,
      // Try not to keep too many useless data
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
