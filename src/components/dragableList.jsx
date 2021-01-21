import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragableContainer from './dragableContainer';

export default function DragableList() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DragableContainer />
    </DndProvider>
  );
}
