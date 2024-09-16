import { useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { useChannel } from '@/hooks/useChannel';

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Write something...' }],
  },
];

interface EditorProps {
  onChange: (value: any) => void;
}

export function Editor({ onChange }: EditorProps) {
  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
      <Editable className="h-screen border-dotted rounded-lg border-stone-200 border-2" />
    </Slate>
  );
}
