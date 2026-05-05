import { Suspense } from 'react';
import { Login } from '@/features/auth/Login';

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
