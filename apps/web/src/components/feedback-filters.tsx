"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, X, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FeedbackFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  statuses: string[];
  priorities: string[];
  hasScreenshots?: boolean;
  isPublic?: boolean | null;
  dateFrom?: Date;
  dateTo?: Date;
}

const CATEGORIES = [
  { value: "BUG", label: "Bug" },
  { value: "FEATURE_REQUEST", label: "Feature Request" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "QUESTION", label: "Question" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function FeedbackFilters({ onFilterChange }: FeedbackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>(() => {
    return {
      categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
      statuses: searchParams.get("statuses")?.split(",").filter(Boolean) || [],
      priorities: searchParams.get("priorities")?.split(",").filter(Boolean) || [],
      hasScreenshots: searchParams.get("hasScreenshots") === "true" ? true : undefined,
      isPublic: searchParams.get("isPublic") === "true" ? true : searchParams.get("isPublic") === "false" ? false : null,
      dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
    };
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.statuses.length > 0) {
      params.set("statuses", filters.statuses.join(","));
    }
    if (filters.priorities.length > 0) {
      params.set("priorities", filters.priorities.join(","));
    }
    if (filters.hasScreenshots) {
      params.set("hasScreenshots", "true");
    }
    if (filters.isPublic !== null && filters.isPublic !== undefined) {
      params.set("isPublic", filters.isPublic.toString());
    }
    if (filters.dateFrom) {
      params.set("dateFrom", filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      params.set("dateTo", filters.dateTo.toISOString());
    }

    router.push(`?${params.toString()}`, { scroll: false });
    onFilterChange?.(filters);
  }, [filters, router, onFilterChange]);

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const togglePriority = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      statuses: [],
      priorities: [],
      hasScreenshots: undefined,
      isPublic: null,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.statuses.length +
    filters.priorities.length +
    (filters.hasScreenshots ? 1 : 0) +
    (filters.isPublic !== null ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px]" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={filters.categories.includes(category.value)}
                        onCheckedChange={() => toggleCategory(category.value)}
                      />
                      <label
                        htmlFor={`category-${category.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-2">
                  {STATUSES.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filters.statuses.includes(status.value)}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <label
                        htmlFor={`status-${status.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="space-y-2">
                  {PRIORITIES.map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={filters.priorities.includes(priority.value)}
                        onCheckedChange={() => togglePriority(priority.value)}
                      />
                      <label
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {priority.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-2">
                <Label>Additional</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasScreenshots"
                      checked={filters.hasScreenshots || false}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          hasScreenshots: checked ? true : undefined,
                        }))
                      }
                    />
                    <label
                      htmlFor="hasScreenshots"
                      className="text-sm font-normal leading-none"
                    >
                      Has screenshots
                    </label>
                  </div>
                </div>
              </div>

              {/* Visibility Filter */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={
                    filters.isPublic === null
                      ? "all"
                      : filters.isPublic
                      ? "public"
                      : "private"
                  }
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      isPublic:
                        value === "all" ? null : value === "public" ? true : false,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public only</SelectItem>
                    <SelectItem value="private">Private only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "PPP")
                        ) : (
                          <span>From</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) =>
                          setFilters((prev) => ({ ...prev, dateFrom: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "PPP")
                        ) : (
                          <span>To</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) =>
                          setFilters((prev) => ({ ...prev, dateTo: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {CATEGORIES.find((c) => c.value === category)?.label}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary">
              {STATUSES.find((s) => s.value === status)?.label}
              <button
                onClick={() => toggleStatus(status)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.priorities.map((priority) => (
            <Badge key={priority} variant="secondary">
              {PRIORITIES.find((p) => p.value === priority)?.label}
              <button
                onClick={() => togglePriority(priority)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.hasScreenshots && (
            <Badge variant="secondary">
              Has screenshots
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, hasScreenshots: undefined }))
                }
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.isPublic !== null && (
            <Badge variant="secondary">
              {filters.isPublic ? "Public" : "Private"}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, isPublic: null }))
                }
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary">
              From: {format(filters.dateFrom, "PPP")}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateFrom: undefined }))
                }
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary">
              To: {format(filters.dateTo, "PPP")}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, dateTo: undefined }))
                }
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
