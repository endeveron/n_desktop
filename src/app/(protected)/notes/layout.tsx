import { NOTES_PAGE_DESCRIPTION, NOTES_PAGE_TITLE } from '@/translations/en';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: NOTES_PAGE_TITLE,
  description: NOTES_PAGE_DESCRIPTION,
};
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
