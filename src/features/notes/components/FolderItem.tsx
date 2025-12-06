'use client';

import {
  Bookmark,
  Brain,
  Lightbulb,
  Shapes,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { FolderElement } from '@/components/images/FolderElement';
import { folderColorMap } from '@/features/notes/maps';
import { FolderItem as TFolderItem } from '@/features/notes/types';
import { Theme } from '@/types';
import { cn } from '@/utils';

interface FolderListProps extends TFolderItem {
  theme: Theme;
  activeFolderId?: string;
  small?: boolean;
}

const FolderItem = ({
  id,
  color,
  // tags,
  // timestamp,
  small,
  title,
  theme,
  activeFolderId,
}: FolderListProps) => {
  const router = useRouter();
  const [folderIconEl, setFolderIconEl] = useState<ReactNode | null>(null);

  const colorGroup = folderColorMap.get(color) || {
    light: '#99a1af',
    dark: '#4a5565',
  };
  const backgroundColor = colorGroup[theme];

  const handleClick = () => {
    router.push(`/notes/folder/${id}`);
  };

  // Init folder icon
  useEffect(() => {
    (async () => {
      switch (title) {
        case 'AI':
          setFolderIconEl(<Sparkles size={16} />);
          break;
        case 'Books':
          setFolderIconEl(<Bookmark size={16} />);
          break;
        case 'Dev':
          setFolderIconEl(<Terminal size={16} />);
          break;
        case 'Ideas':
          setFolderIconEl(<Lightbulb size={16} />);
          break;
        case 'Mind':
          setFolderIconEl(<Brain size={16} />);
          break;
        case 'Misc':
          setFolderIconEl(<Shapes size={16} />);
          break;
        default:
          setFolderIconEl(null);
      }
    })();
  }, [title]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'cursor-pointer select-none',
        small
          ? 'flex items-center dark:text-muted dark:hover:text-foreground hover:bg-card dark:hover:bg-popover/70 rounded-full py-1 pl-2 pr-2.5 trans-c'
          : 'w-12',
        small &&
          activeFolderId === id &&
          'dark:text-foreground bg-card dark:bg-popover/70 pointer-events-none'
      )}
    >
      {small ? (
        // Colored circle
        <div
          className="w-2.5 h-2.5 rounded-full mr-1 trans-c"
          style={{ backgroundColor }}
        />
      ) : (
        // Folder
        <div
          className="relative mb-2 overflow-hidden h-7 rounded-sm trans-c"
          style={{ backgroundColor }}
        >
          {folderIconEl && (
            <div className="anim-fade absolute left-1.25 bottom-1.5 text-white dark:text-white/80">
              {folderIconEl}
            </div>
          )}
          <div className="absolute top-0 right-0 opacity-20 dark:opacity-30 trans-o">
            <FolderElement />
          </div>
        </div>
      )}

      <div
        className="text-xs font-bold tracking-wider text-center truncate trans-c"
        title={small ? '' : title}
      >
        {title}
      </div>
    </div>
  );
};

export default FolderItem;
