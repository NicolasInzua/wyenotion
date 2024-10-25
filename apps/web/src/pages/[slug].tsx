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

export default function Home({
  slug,
  pageContent,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const handleRef = useRef<EditorHandle>(null);

  const [currentUserNames, setCurrentUserNames] = useState<string[]>([]);
  const username = useMemo(() => `user-${crypto.randomUUID()}`, []);

  const onMessage = useCallback((event: string, payload: unknown) => {
    if (
      event === 'user_list' &&
      typeof payload === 'object' &&
      payload !== null &&
      'body' in payload
    )
      setCurrentUserNames(payload.body as string[]);
  }, []);

  const { pushChannelEvent } = useChannel(`page:${slug}`, {
    username,
    onMessage,
  });

  const onChange = (value: unknown) => {
    const content = JSON.stringify(value);
    pushChannelEvent('new_change', { body: content });
  };

  return (
    <div className="m-auto space-y-10 min-h-screen max-w-screen-lg">
      <header className="flex items-center">
        <h1 className="text-4xl font-bold">WyeNotion</h1>
      </header>
      <main className="flex flex-col gap-8">
        <div className="flex justify-end">
          <UserListTooltip userNames={currentUserNames} />
        </div>
        <TextEditor
          onChange={onChange}
          handleRef={handleRef}
          initialContent={pageContent}
        />
      </main>
    </div>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const slug = query.slug as string;

  try {
    const pageContent = await api.fetchPageContent(slug);
    return {
      props: {
        slug,
        pageContent,
      },
    };
  } catch (error) {
    const apiError = error as ApiError;
    return { props: { slug, pageContent: null, apiError } };
  }
}
