import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';

function toUint8Array(str: string): Uint8Array {
  const update_contents = str.split(',').map((s) => parseInt(s));
  return new Uint8Array(update_contents);
}
export interface YDoc {
  sharedType: Y.XmlText;
  awareness: awarenessProtocol.Awareness;
  applyAwarenessUpdate: (update: string) => void;
  applyUpdate: (update: string) => void;
}

export function useYDoc(
  onUpdate: (event: string, update: unknown) => void,
  initialContent: string
): YDoc {
  const [yDoc, setYDoc] = useState<Y.Doc>(new Y.Doc());
  const sharedType = yDoc.get('content', Y.XmlText);

  onUpdate('y_update', Y.encodeStateAsUpdate(yDoc));
  const [awareness, setAwareness] = useState<awarenessProtocol.Awareness>(
    new awarenessProtocol.Awareness(yDoc)
  );

  useEffect(() => {
    const yDoc = new Y.Doc();
    setYDoc(yDoc);
    setAwareness(new awarenessProtocol.Awareness(yDoc));
    if (!initialContent) return;
    applyUpdate(yDoc, initialContent);
  }, [initialContent]);

  useEffect(() => {
    const ydoc = yDoc;

    const handleUpdate = (update: Uint8Array) => {
      onUpdate('y_update', update);
    };

    ydoc.on('update', handleUpdate);
    return () => {
      ydoc.off('update', handleUpdate);
    };
  }, [yDoc, onUpdate]);

  awareness.on('update', () => {
    const updateToUint8Array = awarenessProtocol.encodeAwarenessUpdate(
      awareness,
      [awareness.clientID]
    );
    onUpdate('y_awareness_update', updateToUint8Array);
  });

  const applyAwarenessUpdate = (update: string) => {
    awarenessProtocol.applyAwarenessUpdate(
      awareness,
      toUint8Array(update),
      awareness.clientID
    );
  };

  const applyUpdate = (yDoc: Y.Doc, update: string) => {
    Y.applyUpdate(yDoc, toUint8Array(update));
  };

  return {
    sharedType: sharedType,
    awareness,
    applyUpdate: (update) => applyUpdate(yDoc, update),
    applyAwarenessUpdate,
  };
}
