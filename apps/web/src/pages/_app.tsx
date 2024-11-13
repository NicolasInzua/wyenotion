import AppProvider from '@/contexts/AppProvider';
import { AuthGuard } from '@/auth/AuthGuard';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>WyeNotion</title>
      </Head>
      <AppProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </AppProvider>
    </>
  );
}
