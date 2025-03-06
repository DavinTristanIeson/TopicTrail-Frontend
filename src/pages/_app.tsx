import 'reflect-metadata';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@/styles/globals.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/common/api/query-client';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import mantineTheme from '@/common/constants/theme';

import dayjs from 'dayjs';
import dayjsRelativeTimePlugin from 'dayjs/plugin/relativeTime';

dayjs.extend(dayjsRelativeTimePlugin);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Wordsmith</title>
      </Head>
      <MantineProvider theme={mantineTheme}>
        <ModalsProvider
          modalProps={{
            centered: true,
            withCloseButton: true,
            withinPortal: true,
            withOverlay: true,
            closeOnClickOutside: true,
          }}
        >
          <Notifications
            limit={10}
            position="top-right"
            zIndex={9999999}
            autoClose={5000}
          />
          <QueryClientProvider client={queryClient}>
            {/* Enable this if you need to debug react query */}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            <Component {...pageProps} />
          </QueryClientProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}
