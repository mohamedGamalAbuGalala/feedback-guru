"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangelogListSkeleton } from "@/components/loading-skeletons";

interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  version: string | null;
  type: "FEATURE" | "IMPROVEMENT" | "BUG_FIX" | "BREAKING_CHANGE";
  publishedAt: string;
}

interface PublicChangelogClientProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
}

const typeColors: Record<string, string> = {
  FEATURE: "default",
  IMPROVEMENT: "secondary",
  BUG_FIX: "destructive",
  BREAKING_CHANGE: "outline",
};

const typeLabels: Record<string, string> = {
  FEATURE: "✨ Feature",
  IMPROVEMENT: "🚀 Improvement",
  BUG_FIX: "🐛 Bug Fix",
  BREAKING_CHANGE: "⚠️ Breaking Change",
};

export default function PublicChangelogClient({ workspace }: PublicChangelogClientProps) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEntries();
  }, [page, filterType]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        slug: workspace.slug,
        page: page.toString(),
        limit: "10",
      });

      if (filterType !== "ALL") {
        params.append("type", filterType);
      }

      const response = await fetch(`/api/public/changelog?${params}`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">{workspace.name} Changelog</h1>
          <p className="text-muted-foreground">
            Stay up to date with the latest features and improvements
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filter */}
        <div className="mb-8">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Updates</SelectItem>
              <SelectItem value="FEATURE">Features</SelectItem>
              <SelectItem value="IMPROVEMENT">Improvements</SelectItem>
              <SelectItem value="BUG_FIX">Bug Fixes</SelectItem>
              <SelectItem value="BREAKING_CHANGE">Breaking Changes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries */}
        {loading ? (
          <ChangelogListSkeleton count={3} />
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No changelog entries found. Check back soon for updates!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{entry.title}</CardTitle>
                        {entry.version && (
                          <Badge variant="outline" className="text-sm">
                            v{entry.version}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant={typeColors[entry.type]}>
                          {typeLabels[entry.type]}
                        </Badge>
                        <span>•</span>
                        <span>{formatDate(entry.publishedAt)}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Powered by Feedback Guru</p>
        </div>
      </div>
    </div>
  );
}
