"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeedbackCard } from "@/components/kanban/feedback-card";
import { KanbanColumn } from "@/components/kanban/column";

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  items: Feedback[];
  color: string;
}

const initialColumns: Column[] = [
  { id: "NEW", title: "New", items: [], color: "bg-blue-100" },
  { id: "OPEN", title: "Open", items: [], color: "bg-purple-100" },
  { id: "IN_PROGRESS", title: "In Progress", items: [], color: "bg-yellow-100" },
  { id: "RESOLVED", title: "Resolved", items: [], color: "bg-green-100" },
  { id: "CLOSED", title: "Closed", items: [], color: "bg-gray-100" },
];

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<Feedback | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // In production, fetch from API
      // For now, show empty board with sample data
      const sampleFeedback: Feedback[] = [
        {
          id: "1",
          title: "Login button not working",
          description: "When I click the login button, nothing happens",
          category: "BUG",
          priority: "HIGH",
          status: "NEW",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Add dark mode",
          description: "It would be great to have a dark mode option",
          category: "FEATURE_REQUEST",
          priority: "MEDIUM",
          status: "OPEN",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Improve loading speed",
          description: "The app takes too long to load on mobile",
          category: "IMPROVEMENT",
          priority: "HIGH",
          status: "IN_PROGRESS",
          createdAt: new Date().toISOString(),
        },
      ];

      // Distribute sample feedback to columns
      const updatedColumns = columns.map((column) => ({
        ...column,
        items: sampleFeedback.filter((f) => f.status === column.id),
      }));

      setColumns(updatedColumns);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the active feedback item
    const allItems = columns.flatMap((col) => col.items);
    const item = allItems.find((f) => f.id === active.id);
    setActiveFeedback(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveFeedback(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    const sourceColumn = columns.find((col) =>
      col.items.some((item) => item.id === activeId)
    );

    const destColumn = columns.find(
      (col) => col.id === overId || col.items.some((item) => item.id === overId)
    );

    if (!sourceColumn || !destColumn) return;

    // If same column, no change
    if (sourceColumn.id === destColumn.id) return;

    // Find the feedback item
    const feedbackItem = sourceColumn.items.find((item) => item.id === activeId);
    if (!feedbackItem) return;

    // Update status
    const updatedFeedback = { ...feedbackItem, status: destColumn.id };

    // Update columns
    const newColumns = columns.map((col) => {
      if (col.id === sourceColumn.id) {
        return {
          ...col,
          items: col.items.filter((item) => item.id !== activeId),
        };
      }
      if (col.id === destColumn.id) {
        return {
          ...col,
          items: [...col.items, updatedFeedback],
        };
      }
      return col;
    });

    setColumns(newColumns);

    // Update backend
    try {
      await updateFeedbackStatus(activeId, destColumn.id);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on error
      setColumns(columns);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    // In production, call API to update status
    console.log(`Updating feedback ${feedbackId} to ${newStatus}`);
  };

  const totalFeedback = columns.reduce((sum, col) => sum + col.items.length, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <p className="mt-2 text-gray-600">
          Drag and drop feedback between status columns
        </p>
        <div className="mt-4 flex gap-4">
          <Badge variant="secondary" className="text-sm">
            {totalFeedback} Total
          </Badge>
          {columns.map((col) => (
            <Badge key={col.id} variant="outline" className="text-sm">
              {col.title}: {col.items.length}
            </Badge>
          ))}
        </div>
      </div>

      {totalFeedback === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No feedback to organize</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Start collecting feedback to see it organized in this kanban board
            </p>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column}>
                <SortableContext
                  items={column.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {column.items.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
                  ))}
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeFeedback ? (
              <FeedbackCard feedback={activeFeedback} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
