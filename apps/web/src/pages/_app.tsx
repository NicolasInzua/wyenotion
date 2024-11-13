import AppProvider from '@/contexts/AppProvider';
import { AuthGuard } from '@/auth/AuthGuard';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SideBarLayout } from '@/components/layout/SideBarLayout';
import { NextPage } from 'next';
import { FC } from 'react';

type NextPageWithLayout = NextPage & {
  SideBarContent?: FC<{ content: string[] }>;
};

type CustomAppProps = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps, router }: CustomAppProps) {
  const content = 'pageList' in pageProps ? pageProps.pageList : [];

  return (
    <>
      <Head>
        <title>WyeNotion</title>
      </Head>
      <AppProvider>
        <AuthGuard>
          {router.asPath === '/' ? (
            <Component {...pageProps} />
          ) : (
            <SideBarLayout
              SideBarContent={Component.SideBarContent}
              content={content}
            >
              <Component {...pageProps} />
            </SideBarLayout>
          )}
        </AuthGuard>
      </AppProvider>
    </>
  );
}
