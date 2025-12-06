'use client';

import NoteItem from '@/features/notes/components/NoteItem';
import { FolderItem, NoteItem as TNoteItem } from '@/features/notes/types';
import { useStore } from '@/store';
import { cn } from '@/utils';

const NoteList = ({
  className,
  folders,
  notes,
}: {
  className?: string;
  folders: FolderItem[];
  notes: TNoteItem[];
}) => {
  const isExtraColumn = useStore((state) => state.isExtraColumn);

  return (
    <div
      className={cn(
        'grid grid-cols-1 xl:grid-cols-2 items-start flex-1 w-full gap-2 trans-o',
        !isExtraColumn && 'lg:grid-cols-2 xl:grid-cols-3',
        className
      )}
    >
      {notes.map((data) => (
        <NoteItem {...data} folders={folders} key={data.id} />
      ))}
    </div>
  );
};

export default NoteList;
