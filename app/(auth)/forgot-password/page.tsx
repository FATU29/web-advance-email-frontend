import { Suspense } from 'react';
import { ForgotPasswordForm } from '@/components/authentication/forgot-password-form';

export const metadata = {
  title: 'Forgot Password | Email App',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
