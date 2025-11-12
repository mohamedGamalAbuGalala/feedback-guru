"use client";

import { ReactNode } from "react";
import { PageErrorBoundary } from "@/components/error-boundary";

/**
 * Client-side providers wrapper
 * Includes error boundary and any other providers needed
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary>
      {children}
    </PageErrorBoundary>
  );
}
