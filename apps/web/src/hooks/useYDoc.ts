import { useEffect, useState } from 'react';
import * as Y from 'yjs';

function toUint8Array(str: string): Uint8Array {
  const update_contents = str.split(',').map((s) => parseInt(s));
  return new Uint8Array(update_contents);
}

export interface YDoc {
  sharedType: Y.XmlText;
  applyUpdate: (update: string) => void;
}

export function useYDoc(
  onUpdate: (update: unknown) => void,
  initialContent: string
): YDoc {
  const [yDoc, setYDoc] = useState<Y.Doc>(new Y.Doc());
  const sharedType = yDoc.get('content', Y.XmlText);

  onUpdate(Y.encodeStateAsUpdate(yDoc));

  useEffect(() => {
    const yDoc = new Y.Doc();
    setYDoc(yDoc);

    if (!initialContent) return;
    applyUpdate(yDoc, initialContent);
  }, [initialContent]);

  useEffect(() => {
    const ydoc = yDoc;

    const handleUpdate = (update: Uint8Array) => {
      onUpdate(update);
    };

    ydoc.on('update', handleUpdate);
    return () => {
      ydoc.off('update', handleUpdate);
    };
  }, [yDoc, onUpdate]);

  const applyUpdate = (yDoc: Y.Doc, update: string) => {
    Y.applyUpdate(yDoc, toUint8Array(update));
  };

  return { sharedType, applyUpdate: (update) => applyUpdate(yDoc, update) };
}
