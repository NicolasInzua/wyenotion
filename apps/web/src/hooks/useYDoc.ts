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
  updateAwareness: (update: string) => void;
  applyUpdate: (update: string) => void;
}

export function useYDoc(
  onUpdate: (event: string, update: unknown) => void,
  initialContent: string
): YDoc {
  const [yDoc, setYDoc] = useState<Y.Doc>(new Y.Doc());
  const sharedType = yDoc.get('content', Y.XmlText);
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

    const handleUpdate = () => {
      onUpdate('y_update', Y.encodeStateAsUpdate(ydoc)); // TODO, fullstack: send only update, not whole state
    };

    ydoc.on('update', handleUpdate);
    return () => {
      ydoc.off('update', handleUpdate);
    };
  }, [onUpdate, yDoc]);

  // useEffect(() => {
  //   const handleUpdate = () => {
  //     const updateToUint8Array = awarenessProtocol.encodeAwarenessUpdate(
  //       awareness,
  //       [awareness.clientID]
  //     );
  //     onUpdate('y_awareness_update', updateToUint8Array);
  //   };

  //   awareness.on('update', handleUpdate);
  //   return () => {
  //     awareness.off('update', handleUpdate);
  //     awareness.destroy();
  //   };
  // }, [onUpdate, awareness]);

  awareness.on('update', () => {
    const updateToUint8Array = awarenessProtocol.encodeAwarenessUpdate(
      awareness,
      [awareness.clientID]
    );
    onUpdate('y_awareness_update', updateToUint8Array);
  });

  const updateAwareness = (update: string) => {
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
    updateAwareness,
  };
}
