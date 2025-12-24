'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useSemanticSearchStatusQuery,
  useGenerateEmbeddingsMutation,
} from '@/hooks/use-semantic-search';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SemanticSearchInitializerProps {
  /**
   * Whether to show the component (e.g., only show on first login or when embeddings are missing)
   */
  show?: boolean;
  /**
   * Callback when initialization is complete
   */
  onComplete?: () => void;
  /**
   * Whether to auto-initialize on mount
   */
  autoInitialize?: boolean;
}

/**
 * Component to initialize semantic search by checking availability and generating embeddings.
 * Use this on app startup, user login, or when semantic search features are accessed.
 *
 * Based on the initialization flow from SEARCH_FRONTEND_INTEGRATION.md
 */
export function SemanticSearchInitializer({
  show = true,
  onComplete,
  autoInitialize = false,
}: SemanticSearchInitializerProps) {
  const [hasInitialized, setHasInitialized] = React.useState(false);
  const isMobile = useIsMobile();

  // Check if semantic search is available
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useSemanticSearchStatusQuery();

  // Generate embeddings mutation
  const generateEmbeddingsMutation = useGenerateEmbeddingsMutation();

  const isAvailable = statusData?.available ?? false;

  const handleInitialize = React.useCallback(async () => {
    if (!isAvailable) {
      toast.error(
        'Semantic search is not available. AI service may not be configured.'
      );
      return;
    }

    generateEmbeddingsMutation.mutate(undefined, {
      onSuccess: (data) => {
        setHasInitialized(true);
        toast.success(`✨ Generated embeddings for ${data.generated} emails`, {
          duration: 3000,
        });
        onComplete?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to generate embeddings'
        );
      },
    });
  }, [isAvailable, generateEmbeddingsMutation, onComplete]);

  // Auto-initialize on mount if enabled
  React.useEffect(() => {
    if (autoInitialize && !hasInitialized && isAvailable) {
      handleInitialize();
    }
  }, [autoInitialize, hasInitialized, isAvailable, handleInitialize]);

  if (!show) {
    return null;
  }

  // Loading state
  if (statusLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary shrink-0" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Checking semantic search availability...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (statusError) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
              <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                Failed to check semantic search status
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatus()}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not available state
  if (!isAvailable) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
              AI-powered semantic search is not available. The AI service may
              not be running or configured. Text search is still available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already initialized
  if (hasInitialized) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
              Semantic search is ready! All emails have been indexed for
              AI-powered search.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready to initialize
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
          <span className={isMobile ? 'text-sm' : ''}>
            Initialize AI-Powered Search
          </span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Enable semantic search to find emails by concepts and meaning, not
          just keywords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
            <Badge
              variant="secondary"
              className="gap-1 w-fit text-[10px] sm:text-xs"
            >
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Available
            </Badge>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {statusData?.message || 'AI service is ready'}
            </span>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 sm:p-4 space-y-2 border border-purple-200 dark:border-purple-800">
          <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100">
            💡 What is Semantic Search?
          </p>
          <ul className="text-[11px] sm:text-xs text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
            <li>
              Find emails by <strong>meaning</strong>, not just keywords
            </li>
            <li>Search &quot;money&quot; finds invoices, payments, salary</li>
            <li>Search &quot;meeting&quot; finds appointments, schedules</li>
            <li>Search &quot;urgent&quot; finds deadlines, ASAP requests</li>
          </ul>
        </div>

        <Button
          onClick={handleInitialize}
          disabled={generateEmbeddingsMutation.isPending}
          className="w-full gap-2 h-10 sm:h-auto text-sm"
        >
          {generateEmbeddingsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isMobile ? 'Generating...' : 'Generating Embeddings...'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {isMobile ? 'Initialize AI Search' : 'Initialize Semantic Search'}
            </>
          )}
        </Button>

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
          This will generate AI embeddings for your emails. It may take a few
          moments.
        </p>
      </CardContent>
    </Card>
  );
}
