import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { username, isLoading } = useUser();

  useEffect(() => {
    if (!router.isReady) return;

    if (!isLoading && router.pathname === '/[slug]' && !username) {
      router.replace('/');
    }
  }, [username, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
