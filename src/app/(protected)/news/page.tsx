import { Metadata } from 'next';

import News from '@/features/news/components/News';
import { NEWS_PAGE_DESCRIPTION, NEWS_PAGE_TITLE } from '@/translations/en';

export const metadata: Metadata = {
  title: NEWS_PAGE_TITLE,
  description: NEWS_PAGE_DESCRIPTION,
};

export default async function NewsPage() {
  return <News />;
}
