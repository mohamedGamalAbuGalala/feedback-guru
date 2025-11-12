"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  isLoading?: boolean;
}

export function SearchInput({
  onSearch,
  onClear,
  placeholder = "Search feedback...",
  className,
  debounceMs = 300,
  autoFocus = false,
  isLoading = false,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    onClear?.();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
        autoFocus={autoFocus}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {isLoading && query ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface SearchResultsProps {
  query: string;
  results: any[];
  total: number;
  isLoading: boolean;
  onResultClick?: (result: any) => void;
  renderResult?: (result: any) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function SearchResults({
  query,
  results,
  total,
  isLoading,
  onResultClick,
  renderResult,
  emptyMessage = "No results found",
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a search query to find feedback
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-medium">{emptyMessage}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm text-muted-foreground">
        Found <span className="font-medium text-foreground">{total}</span>{" "}
        {total === 1 ? "result" : "results"} for &quot;{query}&quot;
      </div>
      <div className="space-y-2">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => onResultClick?.(result)}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              onResultClick && "cursor-pointer hover:bg-accent"
            )}
          >
            {renderResult ? renderResult(result) : <div>{result.id}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Highlight search query in text
 */
export function highlightQuery(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
