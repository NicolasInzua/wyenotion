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

export default function App({ Component, pageProps }: CustomAppProps) {
  const content = 'pageList' in pageProps ? pageProps.pageList : [];

  return (
    <>
      <Head>
        <title>WyeNotion</title>
      </Head>
      <SideBarLayout
        SideBarContent={Component.SideBarContent}
        content={content}
      >
        <Component {...pageProps} />
      </SideBarLayout>
    </>
  );
}
