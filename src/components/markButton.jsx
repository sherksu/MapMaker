import React, { useContext, useEffect } from 'react';
import { mapContext } from '../control/mapContext';

export default function MarkButton() {
  const { markMode, setMarkMode } = useContext(mapContext);

  useEffect(() => {
    document.body.style.cursor = markMode ? 'copy' : 'auto';
  }, [markMode]);

  return (
    <button type="button" onClick={() => setMarkMode(!markMode)}>
      {markMode ? 'mark on' : 'mark off'}
    </button>
  );
}
