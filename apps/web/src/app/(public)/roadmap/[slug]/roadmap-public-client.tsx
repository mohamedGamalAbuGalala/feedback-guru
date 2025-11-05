"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Calendar, CheckCircle2, Clock, Wrench } from "lucide-react";
import Link from "next/link";

interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  quarter: string | null;
  votes: number;
  linkedFeedbackIds: string[];
  createdAt: Date;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  projects: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface RoadmapPublicClientProps {
  workspace: Workspace;
  roadmapItems: RoadmapItem[];
}

export function RoadmapPublicClient({ workspace, roadmapItems }: RoadmapPublicClientProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Clock className="w-5 h-5" />;
      case "IN_PROGRESS":
        return <Wrench className="w-5 h-5" />;
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Group items by status
  const groupedItems = {
    PLANNED: roadmapItems.filter((item) => item.status === "PLANNED"),
    IN_PROGRESS: roadmapItems.filter((item) => item.status === "IN_PROGRESS"),
    COMPLETED: roadmapItems.filter((item) => item.status === "COMPLETED"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            {workspace.image ? (
              <img
                src={workspace.image}
                alt={workspace.name}
                className="w-16 h-16 rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {workspace.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{workspace.name} Roadmap</h1>
              <p className="text-gray-600 mt-1">See what we're working on and what's coming next</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              {roadmapItems.length} total items
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-sm">
              {groupedItems.COMPLETED.length} completed
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 text-sm">
              {groupedItems.IN_PROGRESS.length} in progress
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 text-sm">
              {groupedItems.PLANNED.length} planned
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Roadmap Timeline */}
        <div className="space-y-12">
          {Object.entries(groupedItems).map(([status, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    {getStatusIcon(status)}
                    <h2>{status.replace("_", " ")}</h2>
                  </div>
                  <Badge className={getStatusBadgeColor(status)}>{items.length}</Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-tight">
                            {item.title}
                          </CardTitle>
                          <Badge className={getStatusBadgeColor(status)} variant="secondary">
                            {status === "PLANNED" && "📋"}
                            {status === "IN_PROGRESS" && "⚙️"}
                            {status === "COMPLETED" && "✅"}
                          </Badge>
                        </div>
                        {item.quarter && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                            <Calendar className="w-4 h-4" />
                            {item.quarter}
                          </div>
                        )}
                      </CardHeader>

                      {item.description && (
                        <CardContent className="pt-0">
                          <CardDescription>{item.description}</CardDescription>
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {roadmapItems.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No roadmap items yet</h3>
              <p className="text-gray-600 mb-6">
                The team is working on building their roadmap. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="mt-12 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Have a feature request?</h3>
            <p className="text-gray-600 mb-6">
              Share your ideas and vote on what matters most to you
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {workspace.projects.length > 0 && (
                <Link href={`/board/${workspace.projects[0].slug}`}>
                  <button className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow hover:from-indigo-700 hover:to-purple-700">
                    View Feedback Board
                  </button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>Powered by <strong>Feedback Guru</strong></p>
        </div>
      </footer>
    </div>
  );
}
