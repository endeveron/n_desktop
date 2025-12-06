import { NOTES_UPD_INTERVAL } from '@/features/notes/constants';
import { FolderColorKey, folderColorMap } from '@/features/notes/maps';
import { FolderDB, FolderItem, NoteDB, NoteItem } from '@/features/notes/types';
import { Theme } from '@/types';

export const parseFolderItem = (folderDoc: FolderDB): FolderItem => ({
  color: folderDoc.color,
  id: folderDoc._id.toString(),
  tags: folderDoc.tags,
  timestamp: folderDoc.timestamp,
  title: folderDoc.title,
});

export const parseNoteItem = (noteDoc: NoteDB): NoteItem => ({
  content: noteDoc.content,
  favorite: noteDoc.favorite,
  folderId: noteDoc.folderId,
  id: noteDoc._id.toString(),
  tags: noteDoc.tags,
  encrypted: noteDoc.encrypted,
  timestamp: noteDoc.timestamp,
  title: noteDoc.title,
});

export function allowNotesUpdate(
  folders: FolderItem[] | null,
  notesTimestamp: number | null
) {
  if (!folders || !notesTimestamp) return true;
  return Date.now() - notesTimestamp > NOTES_UPD_INTERVAL;
}

export const updateFolders = ({
  folders,
  folder,
}: {
  folders: FolderItem[];
  folder: FolderItem;
}) => {
  const updFolders = [...folders];
  const index = updFolders.findIndex((f) => f.id === folder.id);
  updFolders[index] = folder;
  return updFolders;
};

export const updateFolderNotes = ({
  folderNotes,
  note,
}: {
  folderNotes: NoteItem[];
  note: NoteItem;
}) => {
  const updFolderNotes = [...folderNotes];
  const index = updFolderNotes.findIndex((n) => n.id === note.id);
  updFolderNotes[index] = note;
  return updFolderNotes;
};

export function getFolderColorByKey(key: FolderColorKey, theme: Theme) {
  const colorGroup = folderColorMap.get(key);
  return colorGroup ? colorGroup[theme] : undefined;
}

/**
 * Converts Markdown content into plain text and limits its length.
 * Truncates first, then removes Markdown for performance.
 * @param markdown - The Markdown string to clean up.
 * @param maxLength - The maximum allowed length (default: 60).
 * @returns A cleaned, truncated plain text string.
 */
export function markdownToPlainText(markdown: string, maxLength = 100): string {
  if (!markdown) return '';

  // Slice the input
  let text = markdown.slice(0, maxLength);

  // Remove Markdown syntax
  text = text
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2') // bold/italic
    .replace(/^#+\s*/gm, '') // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // code / inline code
    .replace(/\s+/g, ' ') // collapse spaces/newlines
    .trim();

  return text.trimEnd();
}
