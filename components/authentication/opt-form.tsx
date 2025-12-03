'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { otpSchema, type OTPFormData } from '@/lib/validations/auth';
import {
  useVerifyEmailMutation,
  useResendVerificationOtpMutation,
} from '@/hooks/use-auth-mutations';
import useAuth from '@/lib/stores/use-auth';
import { ROUTES } from '@/utils/constants/routes';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendOtpMutation = useResendVerificationOtpMutation();
  const pendingVerificationEmail = useAuth(
    (state) => state.pendingVerificationEmail
  );
  const emailFromQuery = searchParams.get('email');

  // Get email from store or query params
  const email = pendingVerificationEmail || emailFromQuery || '';

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  // Redirect to signup if no email
  useEffect(() => {
    if (!email) {
      router.push(ROUTES.SIGNUP);
    }
  }, [email, router]);

  const onSubmit = async (data: OTPFormData) => {
    if (!email) {
      toast.error('Email is required');
      router.push(ROUTES.SIGNUP);
      return;
    }

    form.clearErrors();

    try {
      await verifyEmailMutation.mutateAsync({
        email,
        code: data.otp,
      });
      toast.success('Email verified successfully!');
      // Redirect to mail page on success
      const redirectTo = searchParams.get('redirect') || ROUTES.MAIL;
      router.push(redirectTo);
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      // Handle field-specific errors
      if (axiosError.response?.data?.errors) {
        const fieldErrors = axiosError.response.data.errors;
        Object.keys(fieldErrors).forEach((field) => {
          const fieldName = field as keyof OTPFormData;
          if (fieldErrors[field] && fieldErrors[field].length > 0) {
            form.setError(fieldName, {
              type: 'server',
              message: fieldErrors[field][0],
            });
          }
        });
      } else {
        // Show error toast
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Verification failed';
        toast.error(errorMessage);
      }
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is required');
      router.push(ROUTES.SIGNUP);
      return;
    }

    try {
      await resendOtpMutation.mutateAsync({ email });
      toast.success('Verification code sent to your email');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to resend code';
      toast.error(errorMessage);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {email || 'your email'}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          disabled={verifyEmailMutation.isPending}
                          {...field}
                        >
                          <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FieldDescription>
                        Enter the 6-digit code sent to your email.
                      </FieldDescription>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FieldGroup>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyEmailMutation.isPending || !email}
                >
                  {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify'}
                </Button>
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendOtpMutation.isPending || !email}
                    className="underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {resendOtpMutation.isPending ? 'Resending...' : 'Resend'}
                  </button>
                </FieldDescription>
              </FieldGroup>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
