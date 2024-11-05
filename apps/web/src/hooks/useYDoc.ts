import { useEffect, useRef } from 'react';
import * as Y from 'yjs';

export interface YDoc {
  sharedType: Y.XmlText;
  applyUpdate: (update: string) => void;
}

export function useYDoc(
  onUpdate: (update: unknown) => void,
  initialContent: string
): YDoc {
  const yDoc = useRef<Y.Doc>(new Y.Doc());
  const sharedType = useRef<Y.XmlText>(yDoc.current.get('content', Y.XmlText));

  useEffect(() => {
    if (!initialContent) return;
    applyUpdate(initialContent);
  }, [initialContent]);

  useEffect(() => {
    const ydoc = yDoc.current;

    const handleUpdate = () => {
      onUpdate(Y.encodeStateAsUpdate(ydoc)); // TODO, fullstack: send only update, not whole state
    };

    ydoc.on('update', handleUpdate);
    return () => {
      ydoc.off('update', handleUpdate);
    };
  }, [onUpdate]);

  const applyUpdate = (update: string) => {
    const update_contents = update.split(',').map((s) => parseInt(s));
    const parsed_update = new Uint8Array(update_contents);
    Y.applyUpdate(yDoc.current, parsed_update);
  };

  return { sharedType: sharedType.current, applyUpdate };
}
