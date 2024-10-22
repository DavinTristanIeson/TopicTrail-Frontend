import "reflect-metadata";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/globals.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/common/api/query-client";
import type { AppProps } from "next/app";
import Head from "next/head";
import mantineTheme from "@/common/constants/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Parallel</title>
      </Head>
      <MantineProvider theme={mantineTheme}>
        <Notifications
          limit={10}
          position="top-right"
          zIndex={9999999}
          autoClose={4000}
        />
        <QueryClientProvider client={queryClient}>
          {/* Enable this if you need to debug react query */}
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <Component {...pageProps} />
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
}
