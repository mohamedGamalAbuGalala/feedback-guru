"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Slack,
  MessageSquare,
  Webhook,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Integration {
  id: string;
  type: string;
  name: string;
  config: any;
  isActive: boolean;
  createdAt: Date;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}

interface Workspace {
  id: string;
  name: string;
}

interface IntegrationsClientProps {
  workspace: Workspace;
  currentUserRole: string;
  integrations: Integration[];
  webhooks: Webhook[];
}

export function IntegrationsClient({
  workspace,
  currentUserRole,
  integrations,
  webhooks,
}: IntegrationsClientProps) {
  const router = useRouter();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Slack integration state
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [slackChannel, setSlackChannel] = useState("");

  // Discord integration state
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["feedback.created"]);

  const canManageIntegrations = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  const slackIntegration = integrations.find((i) => i.type === "SLACK");
  const discordIntegration = integrations.find((i) => i.type === "DISCORD");

  const availableIntegrations = [
    {
      id: "slack",
      name: "Slack",
      icon: Slack,
      description: "Get notifications in your Slack channels when new feedback arrives",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      isConnected: !!slackIntegration,
      integration: slackIntegration,
    },
    {
      id: "discord",
      name: "Discord",
      icon: MessageSquare,
      description: "Post feedback updates to your Discord server",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      isConnected: !!discordIntegration,
      integration: discordIntegration,
    },
  ];

  const handleConnectSlack = async () => {
    if (!slackWebhookUrl || !canManageIntegrations) return;

    try {
      const response = await fetch("/api/integrations/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          webhookUrl: slackWebhookUrl,
          channel: slackChannel,
        }),
      });

      if (response.ok) {
        setSlackWebhookUrl("");
        setSlackChannel("");
        setIsDialogOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to connect Slack");
      }
    } catch (error) {
      alert("Failed to connect Slack");
    }
  };

  const handleConnectDiscord = async () => {
    if (!discordWebhookUrl || !canManageIntegrations) return;

    try {
      const response = await fetch("/api/integrations/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          webhookUrl: discordWebhookUrl,
        }),
      });

      if (response.ok) {
        setDiscordWebhookUrl("");
        setIsDialogOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to connect Discord");
      }
    } catch (error) {
      alert("Failed to connect Discord");
    }
  };

  const handleCreateWebhook = async () => {
    if (!webhookUrl || !canManageIntegrations) return;

    try {
      const response = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          url: webhookUrl,
          events: webhookEvents,
        }),
      });

      if (response.ok) {
        setWebhookUrl("");
        setWebhookEvents(["feedback.created"]);
        setIsDialogOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create webhook");
      }
    } catch (error) {
      alert("Failed to create webhook");
    }
  };

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    if (!canManageIntegrations) return;

    try {
      const response = await fetch(`/api/integrations/${integrationId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to toggle integration");
      }
    } catch (error) {
      alert("Failed to toggle integration");
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!canManageIntegrations) return;
    if (!confirm("Are you sure you want to delete this integration?")) return;

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete integration");
      }
    } catch (error) {
      alert("Failed to delete integration");
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!canManageIntegrations) return;
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const response = await fetch(`/api/integrations/webhooks/${webhookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete webhook");
      }
    } catch (error) {
      alert("Failed to delete webhook");
    }
  };

  const openDialog = (integrationType: string) => {
    setSelectedIntegration(integrationType);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className={integration.isConnected ? "border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${integration.color}`} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.isConnected && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {integration.isConnected && integration.integration ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Switch
                          checked={integration.integration.isActive}
                          onCheckedChange={() =>
                            handleToggleIntegration(
                              integration.integration!.id,
                              integration.integration!.isActive
                            )
                          }
                          disabled={!canManageIntegrations}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration.integration!.id)}
                          disabled={!canManageIntegrations}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => openDialog(integration.id)}
                      disabled={!canManageIntegrations}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Connect {integration.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Custom Webhooks
              </CardTitle>
              <CardDescription>
                Send feedback events to your own endpoints
              </CardDescription>
            </div>
            {canManageIntegrations && (
              <Button onClick={() => openDialog("webhook")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No webhooks configured yet
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium break-all">{webhook.url}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Events: {webhook.events.join(", ")}
                    </div>
                    {webhook.lastTriggeredAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {webhook.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {canManageIntegrations && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedIntegration === "slack" && (
            <>
              <DialogHeader>
                <DialogTitle>Connect Slack</DialogTitle>
                <DialogDescription>
                  Enter your Slack webhook URL to receive notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="slack-webhook">Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      How to create a webhook
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                <div>
                  <Label htmlFor="slack-channel">Channel (optional)</Label>
                  <Input
                    id="slack-channel"
                    type="text"
                    placeholder="#feedback"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnectSlack}>Connect</Button>
              </DialogFooter>
            </>
          )}

          {selectedIntegration === "discord" && (
            <>
              <DialogHeader>
                <DialogTitle>Connect Discord</DialogTitle>
                <DialogDescription>
                  Enter your Discord webhook URL to receive notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discord-webhook">Webhook URL</Label>
                  <Input
                    id="discord-webhook"
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordWebhookUrl}
                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <a
                      href="https://support.discord.com/hc/en-us/articles/228383668"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      How to create a webhook
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnectDiscord}>Connect</Button>
              </DialogFooter>
            </>
          )}

          {selectedIntegration === "webhook" && (
            <>
              <DialogHeader>
                <DialogTitle>Add Custom Webhook</DialogTitle>
                <DialogDescription>
                  Configure a custom webhook to receive feedback events
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-app.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Events to Subscribe</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: "feedback.created", label: "New Feedback" },
                      { value: "feedback.updated", label: "Feedback Updated" },
                      { value: "feedback.commented", label: "New Comment" },
                      { value: "feedback.status_changed", label: "Status Changed" },
                    ].map((event) => (
                      <div key={event.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={event.value}
                          checked={webhookEvents.includes(event.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookEvents([...webhookEvents, event.value]);
                            } else {
                              setWebhookEvents(webhookEvents.filter((ev) => ev !== event.value));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={event.value} className="cursor-pointer font-normal">
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook}>Create Webhook</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
