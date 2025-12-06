'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';

import FolderItem from '@/features/notes/components/FolderItem';
import { useStore } from '@/store';
import { Theme } from '@/types';
import { cn } from '@/utils';

export interface FolderListProps {
  activeFolderId?: string;
  className?: string;
  delay?: number;
  small?: boolean;
}

const FolderList = ({
  activeFolderId,
  className,
  delay = 0,
  small,
}: FolderListProps) => {
  const { resolvedTheme } = useTheme();

  const folders = useStore((state) => state.folders);
  const fetchingFolders = useStore((state) => state.fetchingFolders);
  const [ready, setReady] = useState(delay === 0);

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.title.localeCompare(b.title));
  }, [folders]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setReady(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className={cn(
        'flex flex-wrap trans-o',
        fetchingFolders
          ? 'opacity-40 pointer-events-none'
          : ready
          ? 'opacity-100'
          : 'opacity-0',
        small ? 'gap-2' : 'gap-3',
        small && ready && 'slide-in-from-top-2 zoom-in-95 animate-in fade-in-0',
        className
      )}
    >
      {sortedFolders.map((data) => (
        <FolderItem
          {...data}
          activeFolderId={activeFolderId}
          small={small}
          theme={resolvedTheme as Theme}
          key={data.id}
        />
      ))}
    </div>
  );
};

export default FolderList;
