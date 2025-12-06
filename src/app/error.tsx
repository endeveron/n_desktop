'use client';

import ErrorDialog from '@/components/shared/ErrorDialog';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDialog error={error} onReset={reset} />;
}
