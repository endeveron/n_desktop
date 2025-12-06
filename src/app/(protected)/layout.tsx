import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/constants';
import { auth } from '~/auth';
import MainShell from '@/components/shell/MainShell';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(SIGNIN_REDIRECT);
  }

  return (
    <div className="anim-fade size-full min-w-xs max-w-400 mx-auto">
      <MainShell>{children}</MainShell>
    </div>
  );
}
