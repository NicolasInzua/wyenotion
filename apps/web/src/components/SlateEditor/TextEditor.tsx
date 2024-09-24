import { useCallback, useEffect, useState } from 'react';
import { createEditor, Operation, Range } from 'slate';
import {
  Editable,
  ReactEditor,
  Slate,
  useFocused,
  useSlateStatic,
  withReact,
} from 'slate-react';
import { RenderLeafProps } from 'slate-react/dist/components/editable';
import { MarkButton } from '@/components/SlateEditor/Buttons';
import type { CustomEditor, MarkedText } from '@/@types/editable';
import {
  useDismiss,
  useFloating,
  useInteractions,
  inline,
  shift,
  flip,
  FloatingPortal,
} from '@floating-ui/react';

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
      <Editable
        renderLeaf={renderLeaf}
        className="h-full border-dotted rounded-lg border-stone-200 border-2"
      />
      <FloatingToolbar />
    </Slate>
  );
}

function FloatingToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const editor = useSlateStatic();
  const focused = useFocused();

  const { refs, context, floatingStyles } = useFloating({
    placement: 'top',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [inline(), shift(), flip()],
  });

  const { getFloatingProps } = useInteractions([useDismiss(context)]);

  useEffect(() => {
    const updateToolbarVisibility = () => {
      const { selection } = editor;
      if (!selection || !focused || Range.isCollapsed(selection)) {
        setIsOpen(false);
        return;
      }

      const domRange = ReactEditor.toDOMRange(editor, selection);
      refs.setReference(domRange);
      setIsOpen(true);
    };

    const { onChange } = editor;
    editor.onChange = () => {
      if (editor.operations.every(Operation.isSelectionOperation)) {
        updateToolbarVisibility();
      }
      onChange();
    };
    return () => {
      editor.onChange = onChange;
    };
  }, [refs, editor, focused]);

  return (
    <>
      {isOpen && (
        <FloatingPortal>
          <div
            className="flex gap-4 p-1 rounded-lg w-fit shadow-md shadow-neutral-300 bg-white"
            ref={refs.setFloating}
            style={{ ...floatingStyles }}
            {...getFloatingProps()}
          >
            <MarkButton format="bold" icon="Bold" />
            <MarkButton format="italic" icon="Italic" />
            <MarkButton format="underline" icon="Underline" />
            <MarkButton format="strikethrough" icon="Strikethrough" />
          </div>
        </FloatingPortal>
      )}
    </>
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
