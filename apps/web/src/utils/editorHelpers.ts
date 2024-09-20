import { CustomEditor, Mark } from '@/@types/editable';
import { Editor } from 'slate';

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

export { isMarkActive, toggleMark };
