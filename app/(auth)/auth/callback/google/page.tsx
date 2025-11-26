'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGoogleSignInMutation } from '@/hooks/use-auth-mutations';
import { ROUTES } from '@/utils/constants/routes';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

type Status = 'loading' | 'success' | 'error';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleSignInMutation = useGoogleSignInMutation();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple calls - authorization code can only be used once
    if (hasProcessedRef.current) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processed immediately to prevent duplicate calls
      hasProcessedRef.current = true;

      try {
        // Get code from query params
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        // Check for OAuth error
        if (errorParam) {
          setStatus('error');
          setErrorMessage(
            errorParam === 'access_denied'
              ? 'Access denied. Please try again.'
              : 'Authentication failed. Please try again.'
          );
          return;
        }

        // Check if code exists
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received. Please try again.');
          return;
        }

        // Call Google sign-in API
        await googleSignInMutation.mutateAsync({ code });

        // Success - redirect to mail page
        toast.success('Successfully signed in with Google');
        setStatus('success');
        setTimeout(() => {
          router.push(ROUTES.MAIL);
        }, 1500);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setStatus('error');

        // Better error message handling
        let errorMsg = 'Failed to authenticate with Google. Please try again.';

        if (axiosError.response?.status === 401) {
          errorMsg =
            'Authorization code has expired or already been used. Please try logging in again.';
        } else if (axiosError.response?.data?.message) {
          errorMsg = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMsg = axiosError.message;
        }

        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Loading state
  if (status === 'loading' || googleSignInMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-6 w-48" />
              <Skeleton className="mx-auto h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle>Authentication Successful</CardTitle>
              <CardDescription>
                You have successfully signed in with Google. Redirecting...
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle>Authentication Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full"
            >
              Back to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.SIGNUP)}
              className="w-full"
            >
              Go to Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
