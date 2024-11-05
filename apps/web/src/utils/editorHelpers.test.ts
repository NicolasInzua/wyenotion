import { beforeEach, describe, expect, test } from 'vitest';
import { createEditor, InsertTextOperation, SplitNodeOperation } from 'slate';
import { isMarkActive, toggleMark, withNodeId } from './editorHelpers';
import { nanoid } from 'nanoid';
import { BlockType, CustomElement } from '@/@types/editable';

describe('isMarkActive', () => {
  const editor = createEditor();

  editor.children = [
    {
      id: nanoid(16),
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 1',
          bold: true,
        },
      ],
    },
    {
      id: nanoid(16),
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 2',
          bold: true,
          italic: true,
        },
      ],
    },
    {
      id: nanoid(16),
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 3a',
        },
        {
          text: 'Test text 3b',
          bold: true,
        },
      ],
    },
  ];

  test('should detect active mark from first element', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(isMarkActive(editor, 'bold')).toBeTruthy();
  });

  test('should detect active mark where multiple marks are active', () => {
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    };
    expect(isMarkActive(editor, 'bold')).toBeTruthy();
    expect(isMarkActive(editor, 'italic')).toBeTruthy();
  });

  test('should detect inactive mark', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(isMarkActive(editor, 'italic')).toBeFalsy();
  });

  test('should not detect any mark on a child within node element', () => {
    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    };
    expect(isMarkActive(editor, 'bold')).toBeFalsy();
  });

  test('should detect mark from multiple elements', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 1], offset: 0 },
    };
    expect(isMarkActive(editor, 'bold')).toBeTruthy();
  });
});

describe('toggleMark', () => {
  const editor = createEditor();

  beforeEach(() => {
    editor.children = [
      {
        id: nanoid(16),
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 1',
            bold: true,
          },
        ],
      },
      {
        id: nanoid(16),
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 2',
          },
        ],
      },
      {
        id: nanoid(16),
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 3a',
          },
          {
            text: 'Test text 3b',
            bold: true,
          },
        ],
      },
    ];
  });

  test('should toggle mark on active mark', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 11 },
    };
    toggleMark(editor, 'bold');

    expect(editor.children[0]).toMatchObject({
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 1',
        },
      ],
    });
  });

  test('should toggle mark on inactive mark', () => {
    editor.selection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 11 },
    };

    toggleMark(editor, 'bold');
    expect(editor.children[1]).toMatchObject({
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 2',
          bold: true,
        },
      ],
    });
  });

  test('should toggle mark on multiple elements', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 11 },
    };

    toggleMark(editor, 'bold');
    expect(editor.children).toMatchObject([
      {
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 1',
          },
        ],
      },
      {
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 2',
          },
        ],
      },
      {
        type: BlockType.Paragraph,
        children: [
          {
            text: 'Test text 3a',
          },
          {
            text: 'Test text 3b',
            bold: true,
          },
        ],
      },
    ]);
  });

  test('should toggle mark on element with already a mark', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 11 },
    };

    toggleMark(editor, 'italic');
    expect(editor.children[0]).toMatchObject({
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 1',
          bold: true,
          italic: true,
        },
      ],
    });
  });

  test('should toggle mark across multiple children inside an element', () => {
    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 1], offset: 12 },
    };

    toggleMark(editor, 'strikethrough');
    expect(editor.children[2]).toMatchObject({
      type: BlockType.Paragraph,
      children: [
        {
          text: 'Test text 3a',
          strikethrough: true,
        },
        {
          text: 'Test text 3b',
          bold: true,
          strikethrough: true,
        },
      ],
    });
  });
});

describe('withNodeId', () => {
  const editor = withNodeId(createEditor());
  const INITIAL_VALUE = [
    {
      id: nanoid(16),
      type: BlockType.Paragraph,
      children: [{ text: '' }],
    },
  ];

  beforeEach(() => {
    editor.children = INITIAL_VALUE;
  });

  test('should add id to new node', () => {
    const splitOpertion: SplitNodeOperation = {
      type: 'split_node',
      path: [0],
      properties: {
        type: BlockType.Paragraph,
        children: [{ text: 'Test text' }],
      },
      position: 0,
    };
    editor.apply(splitOpertion);

    expect(editor.children[1]).toHaveProperty('id');
  });

  test('should not add id to children text', () => {
    const text_oper: InsertTextOperation = {
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'Test text',
    };

    editor.apply(text_oper);
    expect(
      (editor.children[0] as CustomElement).children[0]
    ).not.toHaveProperty('id');
  });
});
