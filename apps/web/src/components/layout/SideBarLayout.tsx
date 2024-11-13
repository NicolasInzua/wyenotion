import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

interface SideBarLayoutProps extends PropsWithChildren {
  SideBarContent?: FC<{ content: string[] }>;
  content: string[];
}

export function SideBarLayout({
  content,
  SideBarContent,
  children,
}: SideBarLayoutProps) {
  return (
    <div className="flex">
      <aside className="w-[200px] space-y-8 bg-neutral-100">
        <Link href={'/'}>
          <header className="flex mx-2 my-1 items-center">
            <h1 className="text-2xl p-1 font-bold w-full rounded-md hover:bg-slate-200">
              WyeNotion
            </h1>
          </header>
        </Link>
        <section className="mx-2">
          {SideBarContent && <SideBarContent content={content} />}
        </section>
      </aside>
      <main className="flex flex-1 m-10">{children}</main>
    </div>
  );
}
