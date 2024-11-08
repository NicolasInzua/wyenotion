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
import { useUser } from '@/contexts/UserContext';

export default function Home({
  slug,
  pageContent,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { username } = useUser();
  const handleRef = useRef<EditorHandle>(null);

  const [currentUserNames, setCurrentUserNames] = useState<string[]>([]);

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
    <div className="m-auto space-y-10 min-h-screen max-w-screen-lg">
      <header className="flex items-center">
        <h1 className="text-4xl font-bold">WyeNotion</h1>
      </header>
      <main className="flex flex-col gap-8">
        <div className="flex justify-end">
          <UserListTooltip userNames={currentUserNames} />
        </div>
        <TextEditor
          initialContent={pageContent}
          handleRef={handleRef}
          onUpdate={onUpdate}
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
