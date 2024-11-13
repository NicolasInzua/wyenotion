import { useCallback, useMemo, useRef, useState } from 'react';
import { useChannel } from '@/hooks/useChannel';
import { TextEditor } from '@/components/SlateEditor/TextEditor';
import { type EditorHandle } from '@/components/SlateEditor/TextEditor';
import { UserListTooltip } from '@/components/UserListTooltip';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { ApiError, api } from '@/services/api';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home({
  slug,
  pageContent,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const handleRef = useRef<EditorHandle>(null);

  const [currentUserNames, setCurrentUserNames] = useState<string[]>([]);
  const username = useMemo(() => `user-${crypto.randomUUID()}`, []);

  const onMessage = useCallback((event: string, payload: unknown) => {
    const objPayload = payload as object;
    if (event === 'user_list' && 'body' in objPayload)
      setCurrentUserNames(objPayload.body as string[]);
    if (event === 'y_update_broadcasted' && 'serialized_update' in objPayload) {
      handleRef.current?.applyUpdate(objPayload.serialized_update as string);
    }
  }, []);

  const { pushChannelEvent } = useChannel(`page:${slug}`, {
    username,
    onMessage,
  });

  const onUpdate = (update: unknown) => {
    pushChannelEvent('y_update', `${update}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex justify-end">
        <UserListTooltip userNames={currentUserNames} />
      </div>
      <TextEditor
        initialContent={pageContent}
        handleRef={handleRef}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const slug = query.slug as string;

  try {
    const [pageContent, pageList] = await Promise.all([
      api.fetchPageContent(slug),
      api.fetchPageList(),
    ]);
    return {
      props: {
        slug,
        pageContent,
        pageList,
      },
    };
  } catch (error) {
    const apiError = error as ApiError;
    return { props: { slug, pageContent: null, apiError } };
  }
}

const HomeSideBarContent = ({ content }: { content: string[] }) => {
  const { query } = useRouter();
  const activeItem = content.find((item) => item === query.slug);
  const sortedContent = content.sort((page1, page2) =>
    page1.localeCompare(page2)
  );

  return (
    <>
      <div className="flex items-center h-8">
        <span className="text-sm text-gray-500 font-medium">Page List</span>
      </div>
      <nav>
        <ul className="flex flex-col overflow-y-auto max-h-[500px] gap-1">
          {sortedContent.map((page) => (
            <li
              key={page}
              className="rounded-md hover:bg-slate-200 px-4 py-1 selected:bg-neutral-200 selected:hover:bg-slate-300"
              data-selected={activeItem === page}
            >
              <Link href={`/${page}`}>
                <span className="text-m font-medium">{page}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

Home.SideBarContent = HomeSideBarContent;
