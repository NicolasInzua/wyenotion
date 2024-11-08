import {
  CustomElement,
  CustomEditor,
  Mark,
  BlockType,
} from '@/@types/editable';
import { nanoid } from 'nanoid';
import { Editor, Operation, Transforms } from 'slate';

const generateId = () => nanoid(16);

const withNodeId = <T extends CustomEditor>(editor: T): T => {
  const { apply } = editor;

  editor.apply = (op) => {
    if (
      Operation.isNodeOperation(op) &&
      op.type === 'split_node' &&
      op.path.length === 1
    ) {
      (op.properties as CustomElement).id = generateId();
    }
    apply(op);
  };

  return editor;
};

const isMarkActive = (editor: CustomEditor, format: Mark) => {
  const marks = Editor.marks(editor);
  return marks?.[format] === true;
};

const toggleMark = (editor: CustomEditor, format: Mark) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const withNormalization = <T extends CustomEditor>(editor: T): T => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;

    if (!Editor.isEditor(node) || node.children.length > 0)
      return normalizeNode(entry);

    Transforms.insertNodes(
      editor,
      {
        id: generateId(),
        type: BlockType.Paragraph,
        children: [{ text: '' }],
      },
      {
        at: [0],
      }
    );
  };

  return editor;
};

const getRandomTransparentColor = (opacity = 0.4) => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export {
  isMarkActive,
  toggleMark,
  withNodeId,
  withNormalization,
  getRandomTransparentColor,
};
