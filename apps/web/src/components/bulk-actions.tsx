"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  CheckSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
} from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete?: () => void;
  totalItems: number;
}

type BulkAction = "updateStatus" | "updatePriority" | "updatePublic" | "delete" | "assign";

export function BulkActions({
  selectedIds,
  onSelectionChange,
  onActionComplete,
  totalItems,
}: BulkActionsProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: BulkAction;
    data?: any;
  } | null>(null);

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;
  const someSelected = selectedCount > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      // This would need to be implemented to select all items
      // For now, we'll just clear selection
      toast({
        title: "Select All",
        description: "Select all functionality needs to be implemented with proper IDs",
        variant: "default",
      });
    }
  };

  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  const confirmAction = (action: BulkAction, data?: any) => {
    setPendingAction({ action, data });
    setShowConfirmDialog(true);
  };

  const performBulkAction = async () => {
    if (!pendingAction || selectedIds.length === 0) return;

    setIsProcessing(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackIds: selectedIds,
          action: pendingAction.action,
          data: pendingAction.data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to perform action");
      }

      toast({
        title: "Success",
        description: result.message || `Updated ${result.affectedCount} items`,
      });

      // Clear selection and refresh
      onSelectionChange([]);
      onActionComplete?.();
    } catch (error: any) {
      console.error("Bulk action error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk action",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          disabled={totalItems === 0}
        />
        <span>Select items to perform bulk actions</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            ref={(el) => {
              if (el && someSelected) {
                el.indeterminate = true;
              }
            }}
          />
          <Badge variant="secondary">{selectedCount} selected</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Update Status */}
        <Select
          onValueChange={(status) => confirmAction("updateStatus", { status })}
          disabled={isProcessing}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <CheckSquare className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="REVIEWING">Reviewing</SelectItem>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Update Priority */}
        <Select
          onValueChange={(priority) => confirmAction("updatePriority", { priority })}
          disabled={isProcessing}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Make Public/Private */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => confirmAction("updatePublic", { isPublic: true })}
          disabled={isProcessing}
        >
          <Eye className="mr-2 h-4 w-4" />
          Make Public
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => confirmAction("updatePublic", { isPublic: false })}
          disabled={isProcessing}
        >
          <EyeOff className="mr-2 h-4 w-4" />
          Make Private
        </Button>

        <div className="h-6 w-px bg-border" />

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => confirmAction("delete")}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === "delete" ? (
                <>
                  Are you sure you want to delete <strong>{selectedCount}</strong>{" "}
                  feedback item{selectedCount !== 1 ? "s" : ""}? This action cannot be
                  undone.
                </>
              ) : (
                <>
                  Are you sure you want to update <strong>{selectedCount}</strong>{" "}
                  feedback item{selectedCount !== 1 ? "s" : ""}?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performBulkAction}>
              {pendingAction?.action === "delete" ? "Delete" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SelectableItemProps {
  id: string;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  children: React.ReactNode;
}

export function SelectableItem({
  id,
  isSelected,
  onSelectionChange,
  children,
}: SelectableItemProps) {
  return (
    <div className={`relative ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="absolute left-2 top-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(checked as boolean)}
          className="bg-background"
        />
      </div>
      <div className={isSelected ? "opacity-90" : ""}>{children}</div>
    </div>
  );
}
