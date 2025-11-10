"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ThumbsUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  quarter: string | null;
  votes: number;
  linkedFeedbackIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Workspace {
  id: string;
  name: string;
}

interface RoadmapClientProps {
  workspace: Workspace;
  currentUserRole: string;
  roadmapItems: RoadmapItem[];
}

export function RoadmapClient({
  workspace,
  currentUserRole,
  roadmapItems,
}: RoadmapClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("PLANNED");
  const [quarter, setQuarter] = useState("");

  const canManageRoadmap = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("PLANNED");
    setQuarter("");
    setEditingItem(null);
  };

  const openDialog = (item?: RoadmapItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setDescription(item.description || "");
      setStatus(item.status);
      setQuarter(item.quarter || "");
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !canManageRoadmap) return;

    try {
      const url = editingItem
        ? `/api/roadmap/${editingItem.id}`
        : "/api/roadmap";
      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          title,
          description: description || null,
          status,
          quarter: quarter || null,
        }),
      });

      if (response.ok) {
        closeDialog();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save roadmap item");
      }
    } catch (error) {
      alert("Failed to save roadmap item");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!canManageRoadmap) return;
    if (!confirm("Are you sure you want to delete this roadmap item?")) return;

    try {
      const response = await fetch(`/api/roadmap/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete roadmap item");
      }
    } catch (error) {
      alert("Failed to delete roadmap item");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "📋";
      case "IN_PROGRESS":
        return "⚙️";
      case "COMPLETED":
        return "✅";
      case "CANCELLED":
        return "❌";
      default:
        return "📋";
    }
  };

  // Group items by status
  const groupedItems = {
    PLANNED: roadmapItems.filter((item) => item.status === "PLANNED"),
    IN_PROGRESS: roadmapItems.filter((item) => item.status === "IN_PROGRESS"),
    COMPLETED: roadmapItems.filter((item) => item.status === "COMPLETED"),
    CANCELLED: roadmapItems.filter((item) => item.status === "CANCELLED"),
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Badge variant="secondary" className="text-sm">
            {roadmapItems.length} total items
          </Badge>
          <Badge className="bg-green-100 text-green-800 text-sm">
            {groupedItems.COMPLETED.length} completed
          </Badge>
        </div>
        {canManageRoadmap && (
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Roadmap Item
          </Button>
        )}
      </div>

      {/* Roadmap Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(groupedItems).map(([status, items]) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{getStatusEmoji(status)}</span>
              <h3 className="font-semibold text-lg">{status.replace("_", " ")}</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </div>

            <div className="space-y-4">
              {items.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-gray-400">
                    No items
                  </CardContent>
                </Card>
              ) : (
                items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">
                          {item.title}
                        </CardTitle>
                        {canManageRoadmap && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(item)}
                              className="h-7 w-7 p-0"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {item.quarter && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {item.quarter}
                        </div>
                      )}
                    </CardHeader>
                    {item.description && (
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm line-clamp-3">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    )}
                    <CardContent className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{item.votes} votes</span>
                        </div>
                        {item.linkedFeedbackIds.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.linkedFeedbackIds.length} feedback
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Roadmap Item" : "Add Roadmap Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update your roadmap item details"
                  : "Create a new item on your product roadmap"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add dark mode support"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Implement dark mode theme throughout the application..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">📋 Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">⚙️ In Progress</SelectItem>
                      <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                      <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quarter">Quarter (optional)</Label>
                  <Input
                    id="quarter"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    placeholder="Q2 2025"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Save Changes" : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
