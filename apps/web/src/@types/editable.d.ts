export type MarkedKeys = 'bold' | 'italic' | 'underline' | 'strikethrough';

export type MarkedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

export type CustomEditor = BaseEditor & ReactEditor;
