'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { FolderPlusIcon } from '@/components/icons/FolderPlusIcon';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import Taskbar from '@/components/shared/Taskbar';
import { useSessionClient } from '@/features/auth/hooks/useSessionClient';
import FolderList from '@/features/notes/components/FolderList';
import NoteList from '@/features/notes/components/NoteList';
import { allowNotesUpdate } from '@/features/notes/utils';
import { useStore } from '@/store';
import { cn } from '@/utils';

const Notes = () => {
  const router = useRouter();
  const { userId } = useSessionClient();

  const fetchFolders = useStore((s) => s.fetchFolders);
  const fetchingFolders = useStore((state) => state.fetchingFolders);
  const folders = useStore((state) => state.folders);
  const isNotesInitialized = useStore((s) => s.isNotesInitialized);
  const notesTimestamp = useStore((s) => s.notesTimestamp);

  const creatingFolder = useStore((s) => s.creatingFolder);
  const createFolder = useStore((s) => s.createFolder);
  const favoriteNotes = useStore((s) => s.favoriteNotes);

  const [mounted, setMounted] = useState(false);

  const updateAllowed = useMemo(
    () => allowNotesUpdate(folders, notesTimestamp),
    [folders, notesTimestamp]
  );

  const handleCreateFolder = async () => {
    if (!userId) return;

    const res = await createFolder({ userId });
    if (res.success && res.data?.id) {
      router.push(`/notes/folder/${res.data.id}`);
    }
  };

  const fetchData = useCallback(async () => {
    if (!userId || !updateAllowed) return;

    console.log('Notes: Fetching folders...');

    const success = await fetchFolders({ userId });
    if (!success) {
      toast('Unable to retrieve folders');
    }
  }, [fetchFolders, updateAllowed, userId]);

  // Wait for client-side mount
  useEffect(() => {
    (() => setMounted(true))();
  }, []);

  // Init folders on mount
  useEffect(() => {
    if (
      !userId ||
      !mounted || // Component not ready
      isNotesInitialized || // Already initialized
      (folders && !updateAllowed) // Data received and stored in the store, Auto-refresh interval not reached
    ) {
      return;
    }

    fetchData();
  }, [
    userId,
    fetchFolders,
    mounted,
    folders,
    updateAllowed,
    fetchData,
    isNotesInitialized,
  ]);

  if (!isNotesInitialized || fetchingFolders) {
    return (
      <Card size="xs">
        <Loading />
      </Card>
    );
  }

  return (
    <div className="size-full flex flex-col gap-2">
      <Card className="flex items-start justify-between gap-1 p-3">
        <FolderList className="flex-1" />
        <Taskbar className="mt-1.25" loading={creatingFolder}>
          <div
            onClick={handleCreateFolder}
            className="ml-1 icon--action"
            title="Create a folder"
          >
            <FolderPlusIcon />
          </div>
        </Taskbar>
      </Card>

      {favoriteNotes.length ? (
        <div
          className={cn(
            'trans-o',
            fetchingFolders && 'opacity-40 pointer-events-none'
          )}
        >
          <NoteList folders={folders} notes={favoriteNotes} />
        </div>
      ) : null}
    </div>
  );
};

export default Notes;
