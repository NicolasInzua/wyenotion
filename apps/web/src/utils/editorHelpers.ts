import { CustomElement, CustomEditor, Mark } from '@/@types/editable';
import { nanoid } from 'nanoid';
import { Editor, Operation } from 'slate';

const generateId = () => nanoid(16);

const withNodeId = (editor: Editor) => {
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

export { isMarkActive, toggleMark, withNodeId };
