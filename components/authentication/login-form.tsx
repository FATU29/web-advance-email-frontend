'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
} from '@/components/ui/field';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { getApiErrorMessages } from '@/utils/function';
import { useState } from 'react';
import { AxiosError } from 'axios';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      // TODO: Implement login API call
      // const response = await loginApi(data);
      // setTokens(response.data.accessToken, response.data.refreshToken);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On success, redirect or handle success
      // router.push('/mail');
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
          const fieldName = field as keyof LoginFormData;
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

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                {generalError && (
                  <FieldError className="text-center">
                    {generalError}
                  </FieldError>
                )}
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
                            disabled={isLoading}
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Login with Google
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/signup"
                      className="underline-offset-4 hover:underline"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
