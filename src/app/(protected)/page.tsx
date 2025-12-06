import Link from 'next/link';

import { Button } from '@/components/shadcn/Button';
import { Card } from '@/components/shared/Card';
import { NEWS_BTN_LABEL, NOTES_BTN_LABEL } from '@/translations/en';

export default async function MainPage() {
  return (
    <Card className="max-h-200 flex-center flex-col gap-6">
      <Link href="/news">
        <Button variant="outline" className="min-w-40">
          {NEWS_BTN_LABEL}
        </Button>
      </Link>
      <Link href="/notes">
        <Button variant="outline" className="min-w-40">
          {NOTES_BTN_LABEL}
        </Button>
      </Link>
    </Card>
  );
}
