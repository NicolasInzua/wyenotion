import { beforeEach, describe, expect, test } from 'vitest';
import { createEditor } from 'slate';
import { isMarkActive, toggleMark } from './editorHelpers';

describe('isMarkActive', () => {
  const editor = createEditor();
  editor.children = [
    {
      children: [
        {
          text: 'Test text 1',
          bold: true,
        },
      ],
    },
    {
      children: [
        {
          text: 'Test text 2',
          bold: true,
          italic: true,
        },
      ],
    },
    {
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
        children: [
          {
            text: 'Test text 1',
            bold: true,
          },
        ],
      },
      {
        children: [
          {
            text: 'Test text 2',
          },
        ],
      },
      {
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

    expect(editor.children[0]).toEqual({
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
    expect(editor.children[1]).toEqual({
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
    expect(editor.children).toEqual([
      {
        children: [
          {
            text: 'Test text 1',
          },
        ],
      },
      {
        children: [
          {
            text: 'Test text 2',
          },
        ],
      },
      {
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
    expect(editor.children[0]).toEqual({
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
    expect(editor.children[2]).toEqual({
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
