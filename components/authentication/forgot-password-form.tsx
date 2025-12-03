'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth';
import { useForgotPasswordMutation } from '@/hooks/use-auth-mutations';
import { ROUTES } from '@/utils/constants/routes';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';

export function ForgotPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    form.clearErrors();

    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success('Password reset code sent to your email');
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      // Handle field-specific errors
      if (axiosError.response?.data?.errors) {
        const fieldErrors = axiosError.response.data.errors;
        Object.keys(fieldErrors).forEach((field) => {
          const fieldName = field as keyof ForgotPasswordFormData;
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
          'Failed to send reset code';
        toast.error(errorMessage);
      }
    }
  };

  if (isSuccess) {
    return (
      <Card {...props}>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a password reset code to {submittedEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldDescription className="text-center">
              Please check your email and click the link to reset your password.
              The code will expire in 10 minutes.
            </FieldDescription>
            <Field>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push(
                    `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(
                      submittedEmail
                    )}`
                  );
                }}
              >
                Enter reset code
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a code to reset your
          password
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
                          disabled={forgotPasswordMutation.isPending}
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
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending
                    ? 'Sending...'
                    : 'Send reset code'}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{' '}
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
