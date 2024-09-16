import { Editor } from '@/components/Editor';
import { useChannel } from '@/hooks/useChannel';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const { pushMessage } = useChannel(`page:${router.query.slug}`);

  const onChange = (value: any) => {
    const content = JSON.stringify(value);
    pushMessage('new_change', { body: content });
  };

  return (
    <div className="m-auto space-y-10 min-h-screen max-w-screen-lg">
      <header className="flex items-center">
        <h1 className="text-4xl font-bold">WyeNotion</h1>
      </header>
      <main className="flex flex-col gap-8">
        <Editor onChange={onChange} />
      </main>
    </div>
  );
}
