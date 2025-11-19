'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { getApiErrorMessages } from '@/utils/function';
import { useState } from 'react';
import { AxiosError } from 'axios';

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (_data: OTPFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      // TODO: Implement OTP verification API call
      // const response = await verifyOtpApi(_data);
      // setTokens(response.data.accessToken, response.data.refreshToken);
      // router.push('/mail');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;
      const errorMessage = getApiErrorMessages(axiosError);

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
        // Handle general error
        setGeneralError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);

    try {
      // TODO: Implement resend OTP API call
      // await resendOtpApi();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      const axiosError = error as AxiosError;
      setResendError(getApiErrorMessages(axiosError));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {generalError && (
                <FieldError className="text-center">{generalError}</FieldError>
              )}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} disabled={isLoading} {...field}>
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {isResending ? 'Resending...' : 'Resend'}
                  </button>
                </FieldDescription>
                {resendError && (
                  <FieldError className="text-center text-sm">
                    {resendError}
                  </FieldError>
                )}
              </FieldGroup>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
