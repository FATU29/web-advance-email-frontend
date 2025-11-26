import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/authentication/reset-password-form';

export const metadata = {
  title: 'Reset Password | Email App',
  description: 'Reset your password with verification code',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
