"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  votes: number;
  createdAt: string;
  _count: {
    comments: number;
  };
}

interface Project {
  id: string;
  name: string;
  slug: string;
  workspaceName: string;
  settings: any;
}

interface PublicBoardClientProps {
  project: Project;
  initialFeedback: Feedback[];
}

const categoryColors: Record<string, string> = {
  BUG: "destructive",
  FEATURE_REQUEST: "default",
  QUESTION: "secondary",
  IMPROVEMENT: "default",
  OTHER: "secondary",
};

const statusColors: Record<string, string> = {
  NEW: "default",
  OPEN: "default",
  IN_PROGRESS: "default",
  RESOLVED: "secondary",
  CLOSED: "secondary",
  PLANNED: "default",
  UNDER_REVIEW: "default",
};

const categoryIcons: Record<string, string> = {
  BUG: "🐛",
  FEATURE_REQUEST: "✨",
  QUESTION: "❓",
  IMPROVEMENT: "💡",
  OTHER: "💬",
};

export default function PublicBoardClient({ project, initialFeedback }: PublicBoardClientProps) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>(initialFeedback);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load voted items from localStorage
    const stored = localStorage.getItem(`voted_${project.id}`);
    if (stored) {
      setVotedItems(new Set(JSON.parse(stored)));
    }
  }, [project.id]);

  useEffect(() => {
    filterAndSortFeedback();
  }, [feedback, searchQuery, categoryFilter, statusFilter, sortBy]);

  const filterAndSortFeedback = () => {
    let filtered = [...feedback];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((f) => f.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((f) => f.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "votes") {
        return b.votes - a.votes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredFeedback(filtered);
  };

  const handleVote = async (feedbackId: string) => {
    if (votedItems.has(feedbackId)) {
      // Unvote
      try {
        const response = await fetch(`/api/public/feedback/${feedbackId}/vote`, {
          method: "DELETE",
        });

        if (response.ok) {
          setFeedback((prev) =>
            prev.map((f) => (f.id === feedbackId ? { ...f, votes: f.votes - 1 } : f))
          );

          const newVoted = new Set(votedItems);
          newVoted.delete(feedbackId);
          setVotedItems(newVoted);
          localStorage.setItem(`voted_${project.id}`, JSON.stringify([...newVoted]));
        }
      } catch (error) {
        console.error("Failed to remove vote:", error);
      }
    } else {
      // Vote
      try {
        const response = await fetch(`/api/public/feedback/${feedbackId}/vote`, {
          method: "POST",
        });

        if (response.ok) {
          setFeedback((prev) =>
            prev.map((f) => (f.id === feedbackId ? { ...f, votes: f.votes + 1 } : f))
          );

          const newVoted = new Set(votedItems);
          newVoted.add(feedbackId);
          setVotedItems(newVoted);
          localStorage.setItem(`voted_${project.id}`, JSON.stringify([...newVoted]));
        }
      } catch (error) {
        console.error("Failed to vote:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">Feedback & Feature Requests</p>
              <p className="text-sm text-gray-500 mt-1">by {project.workspaceName}</p>
            </div>
            <Button>
              <a href={`/board/${project.slug}/submit`}>Submit Feedback</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
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
              <option value="BUG">🐛 Bugs</option>
              <option value="FEATURE_REQUEST">✨ Features</option>
              <option value="IMPROVEMENT">💡 Improvements</option>
              <option value="QUESTION">❓ Questions</option>
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
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "votes" | "recent")}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="votes">Most Voted</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          <div className="flex gap-2 text-sm text-gray-600">
            <span>{filteredFeedback.length} items</span>
            <span>•</span>
            <span>{feedback.filter((f) => f.status === "IN_PROGRESS").length} in progress</span>
            <span>•</span>
            <span>{feedback.filter((f) => f.status === "RESOLVED").length} completed</span>
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedback.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No feedback found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                Be the first to submit feedback or try adjusting your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Vote Button */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleVote(item.id)}
                        className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg border-2 transition-all ${
                          votedItems.has(item.id)
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        <span className="text-sm font-semibold mt-1">{item.votes}</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer">
                          {categoryIcons[item.category]} {item.title}
                        </h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant={statusColors[item.status] as any}>
                            {item.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item._count.comments} comments</span>
                        <span>•</span>
                        <Badge variant={categoryColors[item.category] as any} className="text-xs">
                          {item.category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>Powered by <span className="font-semibold text-primary">Feedback Guru</span></p>
        </div>
      </footer>
    </div>
  );
}
