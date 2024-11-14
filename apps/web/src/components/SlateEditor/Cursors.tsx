import {
  CursorOverlayData,
  useRemoteCursorOverlayPositions,
} from '@slate-yjs/react';

import { CSSProperties, useRef } from 'react';

export type Cursor = {
  name: string;
  color: string;
};

type CaretProps = Pick<CursorOverlayData<Cursor>, 'caretPosition' | 'data'>;

export function Cursors({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursors] = useRemoteCursorOverlayPositions({ containerRef });

  return (
    <div ref={containerRef}>
      {children}
      {cursors.map((cursor) => (
        <Selection
          key={cursor.clientId}
          {...cursor}
          data={cursor.data as Cursor}
        />
      ))}
    </div>
  );
}

function Selection({
  data,
  selectionRects,
  caretPosition,
}: CursorOverlayData<Cursor>) {
  if (!data) return null;

  const selectionStyle: CSSProperties = {
    backgroundColor: data.color,
  };

  return (
    <>
      {selectionRects.map((position, i) => (
        <div
          style={{ ...selectionStyle, ...position }}
          className="absolute pointer-events-none"
          key={i}
        />
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </>
  );
}

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
    <div style={caretStyle} className="absolute w-0.5">
      <div
        className="absolute font-thin italic bg-black whitespace-nowrap top-0 rounded-sm px-1 py-1 pointer-events-none "
        style={labelStyle}
      >
        {data?.name}
      </div>
    </div>
  );
}
