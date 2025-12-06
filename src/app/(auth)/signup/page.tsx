import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/components/shadcn/Card';
import SignUpForm from '@/features/auth/components/SignupForm';
import {
  SIGNUP_CARD_TITLE,
  SIGNUP_PAGE_DESCRIPTION,
  SIGNUP_PAGE_TITLE,
} from '@/translations/en';

export const metadata: Metadata = {
  title: SIGNUP_PAGE_TITLE,
  description: SIGNUP_PAGE_DESCRIPTION,
};

export default async function SignupPage() {
  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{SIGNUP_CARD_TITLE}</CardTitle>
      <SignUpForm />
    </AnimatedCard>
  );
}
