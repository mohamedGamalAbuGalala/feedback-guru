"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  email: string | null;
  name: string | null;
  url: string;
  browser: string | null;
  os: string | null;
  createdAt: string;
  screenshots: {
    id: string;
    url: string;
  }[];
  project: {
    name: string;
  };
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

const statusColors: Record<string, string> = {
  NEW: "default",
  OPEN: "default",
  IN_PROGRESS: "default",
  RESOLVED: "secondary",
  CLOSED: "secondary",
  WONT_FIX: "secondary",
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchQuery, categoryFilter, statusFilter]);

  const fetchFeedback = async () => {
    try {
      // In a real app, fetch from authenticated endpoint
      // For now, we'll need to adjust this to use project-based fetching
      setFeedback([]);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback;

    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    setFilteredFeedback(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="mt-2 text-gray-600">
          Manage and respond to user feedback
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="ALL">All Categories</option>
          <option value="BUG">Bugs</option>
          <option value="FEATURE_REQUEST">Feature Requests</option>
          <option value="IMPROVEMENT">Improvements</option>
          <option value="QUESTION">Questions</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Feedback Table */}
      {filteredFeedback.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
            <p className="text-gray-500 text-center max-w-sm">
              Install the widget on your website to start collecting feedback from users
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/dashboard/projects"}>
              Go to Projects
            </Button>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeedback.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedFeedback(item)}
                >
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 truncate">{item.description}</div>
                      {item.name && (
                        <div className="text-xs text-gray-400 mt-1">
                          by {item.name} {item.email && `(${item.email})`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={categoryColors[item.category] as any}>
                      {item.category.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={priorityColors[item.priority] as any}>
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusColors[item.status] as any}>
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeedback(item);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedFeedback.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={categoryColors[selectedFeedback.category] as any}>
                  {selectedFeedback.category.replace(/_/g, " ")}
                </Badge>
                <Badge variant={priorityColors[selectedFeedback.priority] as any}>
                  {selectedFeedback.priority}
                </Badge>
                <Badge variant={statusColors[selectedFeedback.status] as any}>
                  {selectedFeedback.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
              </div>

              {selectedFeedback.screenshots.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Screenshots</h3>
                  <div className="grid gap-4">
                    {selectedFeedback.screenshots.map((screenshot) => (
                      <img
                        key={screenshot.id}
                        src={screenshot.url}
                        alt="Screenshot"
                        className="rounded-lg border max-w-full h-auto"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-gray-500">URL:</dt>
                  <dd className="text-gray-900 truncate">
                    <a href={selectedFeedback.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedFeedback.url}
                    </a>
                  </dd>
                  <dt className="text-gray-500">Browser:</dt>
                  <dd className="text-gray-900">{selectedFeedback.browser || "Unknown"}</dd>
                  <dt className="text-gray-500">OS:</dt>
                  <dd className="text-gray-900">{selectedFeedback.os || "Unknown"}</dd>
                  <dt className="text-gray-500">Submitted:</dt>
                  <dd className="text-gray-900">{new Date(selectedFeedback.createdAt).toLocaleString()}</dd>
                </dl>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button className="flex-1">Mark as Resolved</Button>
                <Button variant="outline" className="flex-1">Change Status</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
