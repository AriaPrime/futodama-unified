"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to console (could send to monitoring service)
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go home
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
