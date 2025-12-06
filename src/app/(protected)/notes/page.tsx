import { Metadata } from 'next';

import Notes from '@/features/notes/components/Notes';
import { NOTES_PAGE_DESCRIPTION, NOTES_PAGE_TITLE } from '@/translations/en';

export const metadata: Metadata = {
  title: NOTES_PAGE_TITLE,
  description: NOTES_PAGE_DESCRIPTION,
};

export default async function NotesPage() {
  return <Notes />;
}
