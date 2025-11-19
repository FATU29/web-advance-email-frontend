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
import { signupSchema, type SignupFormData } from '@/lib/validations/auth';
import { getApiErrorMessages } from '@/utils/function';
import { useState } from 'react';
import { AxiosError } from 'axios';

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (_data: SignupFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      // TODO: Implement signup API call
      // const response = await signupApi(data);
      // Handle success (e.g., redirect to verify OTP)

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
          const fieldName = field as keyof SignupFormData;
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
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="John Doe"
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
                      <FieldDescription>
                        We&apos;ll use this to contact you. We will not share
                        your email with anyone else.
                      </FieldDescription>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FieldDescription>
                        Must be at least 8 characters with uppercase, lowercase,
                        and number.
                      </FieldDescription>
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FieldGroup>
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
