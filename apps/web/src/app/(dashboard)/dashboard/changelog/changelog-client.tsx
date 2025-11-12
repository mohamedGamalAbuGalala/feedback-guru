"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  version: string | null;
  type: "FEATURE" | "IMPROVEMENT" | "BUG_FIX" | "BREAKING_CHANGE";
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface ChangelogClientProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  userRole: string;
}

const typeColors: Record<string, string> = {
  FEATURE: "default",
  IMPROVEMENT: "secondary",
  BUG_FIX: "destructive",
  BREAKING_CHANGE: "outline",
};

const typeLabels: Record<string, string> = {
  FEATURE: "Feature",
  IMPROVEMENT: "Improvement",
  BUG_FIX: "Bug Fix",
  BREAKING_CHANGE: "Breaking Change",
};

export default function ChangelogClient({ workspace, userRole }: ChangelogClientProps) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    version: "",
    type: "FEATURE" as const,
  });
  const [filterType, setFilterType] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    fetchEntries();
  }, [page, filterType]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        workspaceId: workspace.id,
        page: page.toString(),
        limit: "10",
      });

      if (filterType !== "ALL") {
        params.append("type", filterType);
      }

      const response = await fetch(`/api/changelog?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEntries(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching changelog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setFormData({ title: "", content: "", version: "", type: "FEATURE" });
    setIsDialogOpen(true);
  };

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      version: entry.version || "",
      type: entry.type,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingEntry
        ? `/api/changelog/${editingEntry.id}`
        : "/api/changelog";

      const method = editingEntry ? "PATCH" : "POST";

      const body = editingEntry
        ? formData
        : { ...formData, workspaceId: workspace.id };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchEntries();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save changelog entry");
      }
    } catch (error) {
      console.error("Error saving changelog:", error);
      alert("Failed to save changelog entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this changelog entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/changelog/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEntries();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete changelog entry");
      }
    } catch (error) {
      console.error("Error deleting changelog:", error);
      alert("Failed to delete changelog entry");
    }
  };

  const handleTogglePublish = async (entry: ChangelogEntry) => {
    try {
      const response = await fetch(`/api/changelog/${entry.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !entry.isPublished }),
      });

      if (response.ok) {
        fetchEntries();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update publish status");
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
      alert("Failed to update publish status");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Changelog</h1>
          <p className="text-muted-foreground">
            Manage your product changelog entries
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Label>Filter by Type</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FEATURE">Feature</SelectItem>
            <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
            <SelectItem value="BUG_FIX">Bug Fix</SelectItem>
            <SelectItem value="BREAKING_CHANGE">Breaking Change</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries List */}
      {loading ? (
        <div>Loading...</div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No changelog entries found. Create your first entry to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{entry.title}</CardTitle>
                      <Badge variant={typeColors[entry.type]}>
                        {typeLabels[entry.type]}
                      </Badge>
                      {entry.version && (
                        <Badge variant="outline">v{entry.version}</Badge>
                      )}
                      {entry.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {entry.isPublished && entry.publishedAt
                        ? `Published ${new Date(entry.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(entry.createdAt).toLocaleDateString()}`}
                    </CardDescription>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(entry)}
                        title={entry.isPublished ? "Unpublish" : "Publish"}
                      >
                        {entry.isPublished ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Changelog Entry" : "New Changelog Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Update the changelog entry details"
                : "Create a new changelog entry for your users"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="What's new in this release?"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Describe the changes in detail..."
                className="w-full min-h-[200px] p-3 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version (optional)</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEATURE">Feature</SelectItem>
                    <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                    <SelectItem value="BUG_FIX">Bug Fix</SelectItem>
                    <SelectItem value="BREAKING_CHANGE">
                      Breaking Change
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEntry ? "Save Changes" : "Create Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
