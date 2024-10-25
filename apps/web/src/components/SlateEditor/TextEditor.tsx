import {
  RefObject,
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
  useId,
} from 'react';
import { createEditor, Operation, Range, Transforms } from 'slate';
import {
  Editable,
  ReactEditor,
  Slate,
  useFocused,
  useSlateStatic,
  withReact,
} from 'slate-react';
import {
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react/dist/components/editable';
import { MarkButton } from '@/components/SlateEditor/Buttons';
import {
  type CustomElement,
  type CustomEditor,
  type MarkedText,
  type RichText,
  BlockType,
  Mark,
} from '@/@types/editable';
import {
  useDismiss,
  useFloating,
  useInteractions,
  inline,
  shift,
  flip,
  FloatingPortal,
} from '@floating-ui/react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import { withNodeId, toggleMark } from '@/utils/editorHelpers';
import isHotKey from 'is-hotkey';

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: MarkedText;
  }
}

const HOTKEYS: Record<string, Mark> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+s': 'strikethrough',
};

const INITIAL_VALUE: RichText = [
  {
    id: nanoid(16),
    type: BlockType.Paragraph,
    children: [{ text: '' }],
  },
];

interface EditorProps {
  initialContent: RichText | null;
  onChange: (value: RichText) => void;
  handleRef: RefObject<EditorHandle>;
}

export type EditorHandle = {
  replaceContent: (message: RichText) => void;
};

const useEditor = () => useState(() => withNodeId(withReact(createEditor())));

export function TextEditor({
  initialContent,
  onChange,
  handleRef,
}: EditorProps) {
  const [editor] = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const id = useId();

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const renderElement = useCallback((props: RenderElementProps) => {
    return <SortableElement {...props} />;
  }, []);

  useImperativeHandle(handleRef, () => ({
    replaceContent: (message) => {
      Transforms.removeNodes(editor, { at: [0] });
      Transforms.insertNodes(editor, message);
    },
  }));

  const items = useMemo(() => {
    return editor.children.map((element) => (element as CustomElement).id);
  }, [editor.children]);

  const handleDragStart = ({ active }: DragEndEvent) => {
    if (!active) return;

    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const overIndex = editor.children.findIndex(
      (elem) => (elem as CustomElement).id === over.id
    );

    if (overIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => (node as CustomElement).id === active.id,
        to: [overIndex],
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeElement = editor.children.find(
    (elem) => (elem as CustomElement).id === activeId
  ) as CustomElement;

  return (
    <Slate
      editor={editor}
      initialValue={initialContent || INITIAL_VALUE}
      onChange={onChange}
    >
      <DndContext
        id={id}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            className="h-screen rounded-lg border-stone-100 border-2"
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotKey(hotkey, event)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </SortableContext>
        <DragOverlay
          style={{
            opacity: 0.5,
          }}
        >
          {activeId && <DragOverlayContent element={activeElement} />}
        </DragOverlay>
      </DndContext>
      <FloatingToolbar />
    </Slate>
  );
}

const SortableElement = (props: RenderElementProps) => {
  const { setNodeRef, attributes, isOver, listeners } = useSortable({
    id: props.element.id,
  });

  return (
    <div {...props.attributes}>
      <div
        ref={setNodeRef}
        className={`flex items-center w-full cursor-auto group ${isOver ? 'bg-gray-100' : ''}`}
        {...attributes}
      >
        <button
          className="select-none cursor-grab border-none py-1 px-2 opacity-0 group-hover:opacity-50 transition-opacity"
          contentEditable={false}
          {...listeners}
        >
          ⠿
        </button>
        <div className="flex-grow">
          <Element {...props} />
        </div>
      </div>
    </div>
  );
};

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

function Element({ children }: RenderElementProps) {
  return <p>{children}</p>;
}

function DragOverlayContent({ element }: { element: CustomElement }) {
  const [editor] = useEditor();
  const value = structuredClone(element);

  return (
    <Slate editor={editor} initialValue={[value]}>
      <Editable readOnly />
    </Slate>
  );
}
