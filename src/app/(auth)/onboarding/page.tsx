import { Metadata } from 'next';

import {
  AnimatedCard,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/shadcn/Card';
import { verifyUserId } from '@/features/auth/actions';
import OnboardingForm from '@/features/auth/components/OnboardingForm';
import {
  ONBOARDING_CARD_DESCRIPTION,
  ONBOARDING_CARD_TITLE,
  ONBOARDING_PAGE_DESCRIPTION,
  ONBOARDING_PAGE_TITLE,
} from '@/translations/en';
import { SearchParams } from '@/types';

export const metadata: Metadata = {
  title: ONBOARDING_PAGE_TITLE,
  description: ONBOARDING_PAGE_DESCRIPTION,
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await searchParams;
  const userId = t as string;

  if (!userId) throw new Error(`Invalid search param for user's objectId`);

  // Check the validity of the user objectId
  await verifyUserId(userId);

  return (
    <AnimatedCard>
      <CardTitle className="text-accent">{ONBOARDING_CARD_TITLE}</CardTitle>

      <CardDescription className="text-muted">
        {ONBOARDING_CARD_DESCRIPTION}
      </CardDescription>

      <CardContent>
        <OnboardingForm userId={userId} />
      </CardContent>
    </AnimatedCard>
  );
}
