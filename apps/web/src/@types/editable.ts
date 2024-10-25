import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type Mark = 'bold' | 'italic' | 'underline' | 'strikethrough';

export type RichText = Descendant[];

export type MarkedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

export enum BlockType {
  Paragraph = 'paragraph',
}

type BlockElement = {
  id: string;
  children: MarkedText[];
};

type ParagraphElement = BlockElement & {
  type: BlockType.Paragraph;
};

export type CustomElement = ParagraphElement;

export type CustomEditor = BaseEditor & ReactEditor;
