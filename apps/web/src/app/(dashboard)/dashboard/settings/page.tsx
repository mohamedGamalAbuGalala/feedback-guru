"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  slug: string;
  settings: any;
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublicBoard = async (projectId: string, currentSettings: any) => {
    setSaving(projectId);
    try {
      const newSettings = {
        ...currentSettings,
        publicBoard: {
          ...currentSettings?.publicBoard,
          enabled: !currentSettings?.publicBoard?.enabled,
        },
      };

      const response = await fetch(`/api/projects/${projectId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, settings: data.settings } : p))
        );
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your projects and workspace settings</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Public Board Settings */}
        <Card>
          <CardHeader>
            <CardTitle>🌐 Public Feedback Board</CardTitle>
            <CardDescription>
              Let users view and vote on feedback items. Perfect for feature requests and roadmap transparency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">No projects yet. Create a project to configure public boards.</p>
            ) : (
              projects.map((project) => {
                const isEnabled = project.settings?.publicBoard?.enabled;
                const publicUrl = isEnabled
                  ? `${window.location.origin}/board/${project.slug}`
                  : null;

                return (
                  <div key={project.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{project.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">Project Slug: {project.slug}</p>
                        {isEnabled && (
                          <div className="mt-2">
                            <Label className="text-xs">Public Board URL</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={publicUrl || ""}
                                readOnly
                                className="text-sm font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(publicUrl || "")}
                              >
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(publicUrl || "", "_blank")}
                              >
                                Visit
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={isEnabled ? "default" : "secondary"}>
                          {isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button
                          variant={isEnabled ? "destructive" : "default"}
                          onClick={() => togglePublicBoard(project.id, project.settings)}
                          disabled={saving === project.id}
                        >
                          {saving === project.id
                            ? "Saving..."
                            : isEnabled
                            ? "Disable"
                            : "Enable"}
                        </Button>
                      </div>
                    </div>

                    {isEnabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-900">
                          <strong>📣 Public board is live!</strong> Users can now view and vote on feedback at the URL above.
                          Only feedback marked as "public" will appear on the board.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Workspace</CardTitle>
            <CardDescription>
              Manage your workspace members and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Workspace Name</Label>
              <Input placeholder="My Workspace" className="mt-1" />
            </div>
            <Button variant="outline">Invite Team Members</Button>
            <p className="text-sm text-gray-500">Team invitations coming soon in Phase 3!</p>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle>🔌 Integrations</CardTitle>
            <CardDescription>
              Connect Feedback Guru with your favorite tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-gray-500">Get notified in Slack when feedback arrives</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Discord</p>
                  <p className="text-sm text-gray-500">Send feedback to Discord channels</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Webhooks</p>
                  <p className="text-sm text-gray-500">Custom webhook integrations</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
