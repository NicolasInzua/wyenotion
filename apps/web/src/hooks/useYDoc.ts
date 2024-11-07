import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';

export interface YDoc {
  sharedType: Y.XmlText;
  awareness: awarenessProtocol.Awareness;
  applyUpdate: (update: string) => void;
}

export function useYDoc(
  onUpdate: (event: string, update: unknown) => void,
  initialContent: string,
  currentUser?: string
): YDoc {
  const [yDoc, setYDoc] = useState<Y.Doc>(new Y.Doc());
  const sharedType = yDoc.get('content', Y.XmlText);
  const [awareness, setAwareness] = useState<awarenessProtocol.Awareness>(
    new awarenessProtocol.Awareness(yDoc)
  );

  useEffect(() => {
    const yDoc = new Y.Doc();
    setYDoc(yDoc);
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
  }, [onUpdate]);

  useEffect(() => {
    if (!currentUser) return;

    awareness.setLocalStateField('user', currentUser);

    const handleUpdate = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      onUpdate('y_awareness_update', { added, updated, removed });
    };

    awareness.on('update', handleUpdate);
    return () => {
      awareness.off('update', handleUpdate);
      awareness.destroy();
    };
  }, [currentUser, onUpdate]);

  const applyUpdate = (yDoc: Y.Doc, update: string) => {
    const update_contents = update.split(',').map((s) => parseInt(s));
    const parsed_update = new Uint8Array(update_contents);
    Y.applyUpdate(yDoc, parsed_update);
  };

  return {
    sharedType: sharedType,
    awareness,
    applyUpdate: (update) => applyUpdate(yDoc, update),
  };
}
