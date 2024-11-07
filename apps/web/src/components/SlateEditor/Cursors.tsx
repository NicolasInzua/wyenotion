import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';

import { CSSProperties, PropsWithChildren, useRef } from 'react';

export type Cursor = {
  name: string;
  color: string;
};

interface CursorsProps extends PropsWithChildren {}

export function Cursors({ children }: CursorsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursors] = useRemoteCursorOverlayPositions({ containerRef });
  console.log('cursors', cursors);

  return (
    <div ref={containerRef}>
      {children}
      {cursors.map((cursor) => (
        <p>cursor</p>
        // <Selection key={cursor.clientId} {...cursor} />
      ))}
    </div>
  );
}

function Selection({
  data,
  selectionRects,
  caretPosition,
}: CursorOverlayData<Cursor>) {
  if (!data) {
    return null;
  }

  const selectionStyle: CSSProperties = {
    backgroundColor: data.color,
  };

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          style={{ ...selectionStyle, ...position }}
          className="absolute pointer-events-none opacity-20 "
          key={i}
        />
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </>
  );
}

type CaretProps = Pick<CursorOverlayData<Cursor>, 'caretPosition' | 'data'>;

function Caret({ caretPosition, data }: CaretProps) {
  const caretStyle: CSSProperties = {
    ...caretPosition,
    background: data?.color,
  };

  const labelStyle: CSSProperties = {
    transform: 'translateY(-100%)',
    background: data?.color,
  };

  return (
    <div style={caretStyle} className="absolute w-1">
      <div
        className="absolute font-normal bg-black whitespace-nowrap top-0 rounded-md px-1 py-2 pointer-events-none "
        style={labelStyle}
      >
        {data?.name}
      </div>
    </div>
  );
}
