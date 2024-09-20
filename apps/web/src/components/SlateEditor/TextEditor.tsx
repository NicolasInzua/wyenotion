import { useCallback, useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { RenderLeafProps } from 'slate-react/dist/components/editable';
import { MarkButton } from '@/components/SlateEditor/Buttons';
import type { CustomEditor, MarkedText } from '@/@types/editable';

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Text: MarkedText;
  }
}

const INITIAL_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: 'Write something...' }],
  },
];

interface EditorProps {
  onChange: (value: any) => void;
}

export function TextEditor({ onChange }: EditorProps) {
  const [editor] = useState(() => withReact(createEditor()));
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  return (
    <Slate editor={editor} initialValue={INITIAL_VALUE} onChange={onChange}>
      <Toolbar>
        <MarkButton format="bold" icon="Bold" />
        <MarkButton format="italic" icon="Italic" />
        <MarkButton format="underline" icon="Underline" />
        <MarkButton format="strikethrough" icon="Strikethrough" />
      </Toolbar>
      <Editable
        renderLeaf={renderLeaf}
        className="h-full border-dotted rounded-lg border-stone-200 border-2"
      />
    </Slate>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-5 rounded-lg w-fit shadow-md shadow-neutral-300">
      {children}
    </div>
  );
}

function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  const classes = [
    leaf.bold && 'font-bold',
    leaf.italic && 'italic',
    leaf.underline && 'underline',
    leaf.strikethrough && 'line-through',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...attributes}>
      {children}
    </span>
  );
}
