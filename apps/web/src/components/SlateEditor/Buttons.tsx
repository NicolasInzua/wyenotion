import { Mark } from '@/@types/editable';
import { Icon, IconName } from '@/components/Icon';
import { useSlate } from 'slate-react';
import { isMarkActive, toggleMark } from '@/utils/editorHelpers';

interface MarkButtonProps {
  format: Mark;
  icon: IconName;
}

export function MarkButton({ format, icon }: MarkButtonProps) {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);
  return (
    <button
      className="p-1 rounded-md selected:bg-neutral-200 selected:hover:bg-slate-300 hover:bg-neutral-100"
      data-selected={isActive}
      onClick={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon name={icon} />
    </button>
  );
}
