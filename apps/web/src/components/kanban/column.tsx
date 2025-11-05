import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface Column {
  id: string;
  title: string;
  items: any[];
  color: string;
}

interface KanbanColumnProps {
  column: Column;
  children: ReactNode;
}

export function KanbanColumn({ column, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 ${isOver ? "opacity-75" : ""}`}
    >
      <div className="mb-4">
        <div className={`${column.color} rounded-lg p-3`}>
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{column.items.length} items</p>
        </div>
      </div>
      <div className="space-y-3 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
