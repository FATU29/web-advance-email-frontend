import { Suspense } from 'react';
import { OTPForm } from '@/components/authentication/opt-form';

export const metadata = {
  title: 'Verify OTP | Email App',
  description: 'Verify your email with the code we sent',
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPForm />
    </Suspense>
  );
}
