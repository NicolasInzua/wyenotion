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
        <header className="flex mx-2 my-1 items-center">
          <h1 className="text-2xl font-bold">WyeNotion</h1>
        </header>
        <section className="mx-2">
          {SideBarContent && <SideBarContent content={content} />}
        </section>
      </aside>
      <main className="flex flex-1 m-10">{children}</main>
    </div>
  );
}
