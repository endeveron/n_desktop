import { Metadata } from 'next';

import { AnimatedCard, CardContent, CardTitle } from '@/components/shadcn/Card';
import GenerateTokenButton from '@/features/auth/components/GenerateTokenButton';
import {
  APP_NAME,
  EMAIL_VERIFY_RESEND_BUTTON,
  EMAIL_VERIFY_SENT_INTRO,
  EMAIL_VERIFY_SENT_OUTRO,
  EMAIL_VERIFY_SPAM_WARNING,
  EMAIL_VERIFY_TITLE,
} from '@/translations/en';
import { SearchParams } from '@/types';

export const metadata: Metadata = {
  title: `Verify Email – ${APP_NAME}`,
  description: 'Account creation',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e } = await searchParams;
  const email = e as string;

  if (!email) {
    throw new Error('Invalid search param for email');
  }

  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{EMAIL_VERIFY_TITLE}</CardTitle>

      <CardContent>
        <p className="text-center px-4">
          {EMAIL_VERIFY_SENT_INTRO}{' '}
          <strong className="text-accent">{email}</strong>.{' '}
          {EMAIL_VERIFY_SENT_OUTRO}
        </p>

        <p className="my-4 text-center text-sm text-muted">
          {EMAIL_VERIFY_SPAM_WARNING}
        </p>

        <div className="flex-center">
          <GenerateTokenButton
            email={email}
            btnTitle={EMAIL_VERIFY_RESEND_BUTTON}
            variant="outline"
          />
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
