import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface FeedbackCardProps {
  feedback: Feedback;
  isDragging?: boolean;
}

const categoryColors: Record<string, string> = {
  BUG: "destructive",
  FEATURE_REQUEST: "default",
  QUESTION: "secondary",
  IMPROVEMENT: "default",
  OTHER: "secondary",
};

const priorityColors: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "default",
  URGENT: "destructive",
};

const categoryIcons: Record<string, string> = {
  BUG: "🐛",
  FEATURE_REQUEST: "✨",
  QUESTION: "❓",
  IMPROVEMENT: "💡",
  OTHER: "💬",
};

export function FeedbackCard({ feedback, isDragging }: FeedbackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: feedback.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
              {categoryIcons[feedback.category]} {feedback.title}
            </h4>
          </div>
          <Badge
            variant={priorityColors[feedback.priority] as any}
            className="text-xs flex-shrink-0"
          >
            {feedback.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {feedback.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <Badge variant={categoryColors[feedback.category] as any} className="text-xs">
            {feedback.category.replace(/_/g, " ")}
          </Badge>
          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
