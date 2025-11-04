"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  apiKey: string;
  createdAt: string;
  workspace: {
    name: string;
  };
  _count: {
    feedback: number;
  };
  settings: any;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Project not found</div>
      </div>
    );
  }

  const widgetCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['FeedbackGuru']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'fg', '${process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3001'}/widget.js'));
  fg('init', {
    apiKey: '${project.apiKey}',
    position: '${project.settings?.widgetPosition || 'bottom-right'}',
    primaryColor: '${project.settings?.primaryColor || '#6366f1'}'
  });
</script>`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <Badge variant="secondary" className="text-lg px-4 py-1">
            {project._count.feedback} feedback
          </Badge>
        </div>
        <p className="text-gray-600">{project.workspace.name}</p>
        {project.description && (
          <p className="mt-2 text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Installation */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Installation</CardTitle>
            <CardDescription>
              Add this code snippet to your website before the closing &lt;/body&gt; tag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                <code>{widgetCode}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(widgetCode)}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </Button>
            </div>
            <div className="pt-2 border-t">
              <h4 className="font-medium text-sm mb-2">Quick Test</h4>
              <p className="text-xs text-gray-600 mb-2">
                Open your browser console and paste this to test:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                fg(&apos;open&apos;)
              </code>
            </div>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <CardTitle>🔑 API Key</CardTitle>
            <CardDescription>
              Use this key to authenticate widget requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={project.apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(project.apiKey)}
                >
                  {copied ? "✓" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Keep this key secret. Anyone with this key can submit feedback to your project.
              </p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-medium text-sm">Project Details</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">Created:</span> {new Date(project.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Slug:</span> {project.slug}</p>
                <p><span className="font-medium">Total Feedback:</span> {project._count.feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Customization */}
        <Card>
          <CardHeader>
            <CardTitle>🎨 Widget Customization</CardTitle>
            <CardDescription>
              Customize the appearance of your feedback widget
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={project.settings?.widgetPosition || "bottom-right"}
                readOnly
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2 items-center">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: project.settings?.primaryColor || "#6366f1" }}
                />
                <Input
                  value={project.settings?.primaryColor || "#6366f1"}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Customization options coming soon in the settings page
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Quick Stats</CardTitle>
            <CardDescription>
              Recent feedback statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Total Feedback</span>
                <span className="font-semibold">{project._count.feedback}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Bugs</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Feature Requests</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Feedback →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
