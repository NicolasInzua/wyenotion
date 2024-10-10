import { TextEditor } from '@/components/SlateEditor/TextEditor';
import { useChannel } from '@/hooks/useChannel';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { type EditorHandle } from '@/components/SlateEditor/TextEditor';

export default function Home() {
  const router = useRouter();
  const handleRef = useRef<EditorHandle>(null);

  const { pushMessage } = useChannel(`page:${router.query.slug}`, {
    username: `user-${crypto.randomUUID()}`,
    onJoin: (message) => {
      if (!message) return;
      handleRef.current?.replaceContent(JSON.parse(message));
    },
  });

  const onChange = (value: unknown) => {
    const content = JSON.stringify(value);
    pushMessage('new_change', { body: content });
  };

  return (
    <div className="m-auto space-y-10 min-h-screen max-w-screen-lg">
      <header className="flex items-center">
        <h1 className="text-4xl font-bold">WyeNotion</h1>
      </header>
      <main className="flex flex-col gap-8">
        <TextEditor onChange={onChange} handleRef={handleRef} />
      </main>
    </div>
  );
}
