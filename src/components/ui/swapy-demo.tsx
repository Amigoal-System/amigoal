
'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialColumns = {
  'Hauptplatz': {
    name: 'Hauptplatz',
    items: [
      { id: 'item-a', content: '1. Mannschaft', time: '18:30 - 20:00 (Ganzer Platz)' },
      { id: 'item-b', content: 'Senioren 30+', time: '20:00 - 21:30 (Ganzer Platz)' },
    ],
  },
  'Kunstrasen': {
    name: 'Kunstrasen',
    items: [
      { id: 'item-c', content: 'Junioren A1', time: '19:00 - 20:30 (1/2 Feld)' },
      { id: 'item-d', content: 'Damen', time: '19:00 - 20:30 (1/2 Feld)' },
    ],
  },
  'Platz 2': {
    name: 'Platz 2',
    items: [
        { id: 'item-e', content: 'Junioren C1', time: '18:00 - 19:30' }
    ],
  },
};

const DraggableItem = ({ item, index }) => (
  <Draggable draggableId={item.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`p-4 border rounded-lg bg-card text-card-foreground shadow-sm cursor-grab active:cursor-grabbing mb-4 ${
          snapshot.isDragging ? 'bg-primary/10' : ''
        }`}
      >
        <h4 className="font-bold text-lg">{item.content}</h4>
        <p className="text-sm text-muted-foreground">{item.time}</p>
      </div>
    )}
  </Draggable>
);

const DroppableColumn = ({ column, items }) => (
  <div className="space-y-2">
    <h3 className="font-semibold text-center">{column.name}</h3>
    <Droppable droppableId={column.name}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 p-2 rounded-lg bg-background min-h-48 transition-colors ${
            snapshot.isDraggingOver ? 'bg-muted' : ''
          }`}
        >
          {items.map((item, index) => (
            <DraggableItem key={item.id} item={item} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

export function SwapyDemo() {
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside a valid drop area
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      // Reordering within the same column
      const newItems = Array.from(startColumn.items);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);

      const newColumn = {
        ...startColumn,
        items: newItems,
      };

      setColumns({
        ...columns,
        [startColumn.name]: newColumn,
      });
    } else {
      // Moving between columns
      const startItems = Array.from(startColumn.items);
      const [removed] = startItems.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        items: startItems,
      };

      const endItems = Array.from(endColumn.items);
      endItems.splice(destination.index, 0, removed);
      const newEndColumn = {
        ...endColumn,
        items: endItems,
      };

      setColumns({
        ...columns,
        [startColumn.name]: newStartColumn,
        [endColumn.name]: newEndColumn,
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <DroppableColumn key={columnId} column={column} items={column.items} />
        ))}
      </div>
    </DragDropContext>
  );
}
