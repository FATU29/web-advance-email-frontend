'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations/auth';
import { useResetPasswordMutation } from '@/hooks/use-auth-mutations';
import { ROUTES } from '@/utils/constants/routes';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';

export function ResetPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  // Get email from query params or form
  const emailFromQuery = searchParams.get('email') || '';

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: emailFromQuery,
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    form.clearErrors();

    try {
      await resetPasswordMutation.mutateAsync({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      // Handle field-specific errors
      if (axiosError.response?.data?.errors) {
        const fieldErrors = axiosError.response.data.errors;
        Object.keys(fieldErrors).forEach((field) => {
          const fieldName = field as keyof ResetPasswordFormData;
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
          'Password reset failed';
        toast.error(errorMessage);
      }
    }
  };

  if (isSuccess) {
    return (
      <Card {...props}>
        <CardHeader>
          <CardTitle>Password reset successful</CardTitle>
          <CardDescription>
            Your password has been reset successfully. Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button asChild className="w-full">
                <Link href={ROUTES.LOGIN}>Go to login</Link>
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email and your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          disabled={
                            resetPasswordMutation.isPending || !!emailFromQuery
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          disabled={resetPasswordMutation.isPending}
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

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          disabled={resetPasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your new password"
                          disabled={resetPasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? 'Resetting password...'
                    : 'Reset password'}
                </Button>
                <FieldDescription className="text-center">
                  <Link
                    href={ROUTES.LOGIN}
                    className="underline-offset-4 hover:underline"
                  >
                    Back to login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
