import { Suspense } from 'react';
import { LoginForm } from '@/components/authentication/login-form';

export const metadata = {
  title: 'Login | Email App',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
