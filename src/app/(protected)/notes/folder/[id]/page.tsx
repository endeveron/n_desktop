'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { EditIcon } from '@/components/icons/EditIcon';
import { FilePlusIcon } from '@/components/icons/FilePlusIcon';
import { FolderFilledIcon } from '@/components/icons/FolderFilledIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { Button } from '@/components/shadcn/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/Dialog';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
} from '@/components/shadcn/Form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/Select';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import { NavBack } from '@/components/shared/NavBack';
import { PageContentBox } from '@/components/shared/PageContentBox';
import Taskbar from '@/components/shared/Taskbar';
import TaskbarPrompt from '@/components/shared/TaskbarPrompt';
import { useSessionClient } from '@/features/auth/hooks/useSessionClient';
import FolderList from '@/features/notes/components/FolderList';
import NoteList from '@/features/notes/components/NoteList';
import { FolderColorKey, folderColors } from '@/features/notes/maps';
import {
  updateFolderSchema,
  UpdateFolderSchema,
} from '@/features/notes/schemas';
import { FolderItem } from '@/features/notes/types';
import { getFolderColorByKey } from '@/features/notes/utils';
import { useStore } from '@/store';
import {
  CANCEL_BUTTON_LABEL,
  CREATE_NOTE_BTN_LABEL,
  CREATE_NOTE_TITLE,
  DELETE_FOLDER_TITLE,
  EDIT_FOLDER_DIALOG_ACCEPT_BTN_LABEL,
  EDIT_FOLDER_DIALOG_DESCRIPTION,
  EDIT_FOLDER_DIALOG_TITLE,
  EDIT_FOLDER_FORM_COLOR_PLACEHOLDER,
  EDIT_TITLE,
  TOAST_CREATE_NOTE_ERROR,
  TOAST_DELETE_FOLDER_ERROR,
  TOAST_GET_NOTES_ERROR,
  TOAST_UPDATE_FOLDER_ERROR,
} from '@/translations/en';
import { Theme } from '@/types';
import { cn } from '@/utils';

export default function FolderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const { userId } = useSessionClient();

  const creatingNote = useStore((s) => s.creatingNote);
  const removingFolder = useStore((s) => s.removingFolder);
  const folderIdFromStore = useStore((s) => s.folderId);
  const folders = useStore((s) => s.folders);
  const folderNotes = useStore((s) => s.folderNotes);
  const isFolderNotesFetching = useStore((s) => s.isFolderNotesFetching);
  const updatingFolder = useStore((s) => s.updatingFolder);
  const createNote = useStore((s) => s.createNote);
  const fetchFolderNotes = useStore((s) => s.fetchFolderNotes);
  const removeFolder = useStore((s) => s.removeFolder);
  const setFolderId = useStore((s) => s.setFolderId);
  const updateFolder = useStore((s) => s.updateFolder);

  const [folderData, setFolderData] = useState<FolderItem | null>(null);
  const [removeFolderPrompt, setRemoveFolderPrompt] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<UpdateFolderSchema>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      title: '',
      color: '',
    },
  });

  const folderId = useMemo(() => {
    const pathArr = pathname.split('/');
    return pathArr.includes('folder') ? pathArr[3] : null;
  }, [pathname]);

  const folderColor: string | null = useMemo(() => {
    if (!folderData?.color) return null;
    return (
      getFolderColorByKey(folderData.color, resolvedTheme as Theme) ?? null
    );
  }, [folderData?.color, resolvedTheme]);

  const handleCreateNote = async () => {
    if (!folderId || !userId) return;

    const res = await createNote({ folderId, userId });
    if (!res.success) {
      toast(res.error.message ?? TOAST_CREATE_NOTE_ERROR);
      return;
    }

    if (res.data?.id) {
      router.push(`/notes/${res.data.id}?status=new`);
    }
  };

  const handleRemoveFolder = () => {
    setRemoveFolderPrompt(true);
  };

  const handleRemoveFolderAccept = async () => {
    if (!folderId || !userId) return;

    const res = await removeFolder({ folderId, userId });
    if (!res.success) {
      toast(res.error.message ?? TOAST_DELETE_FOLDER_ERROR);
      setRemoveFolderPrompt(false);
      return;
    }

    setRemoveFolderPrompt(false);
    router.replace('/notes');
  };

  const handleRemoveFolderDecline = () => {
    setRemoveFolderPrompt(false);
  };

  const onSubmit = async (values: UpdateFolderSchema) => {
    if (!folderData || !folderId || !userId) return;

    const res = await updateFolder({
      color: values.color as FolderColorKey,
      folderId,
      title: values.title,
      userId,
    });

    if (!res.success) {
      toast(res.error.message ?? TOAST_UPDATE_FOLDER_ERROR);
    }

    setFolderData({
      ...folderData,
      color: values.color as FolderColorKey,
      title: values.title,
    });
    setIsDialogOpen(false);
  };

  // Initialization: retrieve folder data from the folders array
  useEffect(() => {
    if (!folderId || !userId) return;

    (async () => {
      const index = folders.findIndex((f) => f.id === folderId);
      if (index === -1) return;

      setFolderData(folders[index]);

      // Check if folder notes for the current folder id persist in local store
      if (folderId === folderIdFromStore) {
        // Folder notes data is relevant, no need to retrieve
        return;
      }

      // Fetch folder notes
      const success = await fetchFolderNotes({ folderId, userId });

      if (!success) toast(TOAST_GET_NOTES_ERROR);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, userId, fetchFolderNotes]);

  // Reset form when folderData changes
  useEffect(() => {
    if (!folderData) return;

    form.reset({
      title: folderData.title,
      color: folderData.color,
    });
  }, [folderData, form]);

  // Save folder ID in store
  useEffect(() => {
    if (!folderId || folderId === folderIdFromStore) {
      return;
    }

    setFolderId(folderId);
  }, [folderId, folderIdFromStore, setFolderId]);

  const createNoteBtn = (
    <div className="anim-slide my-6 flex-center">
      <Button onClick={handleCreateNote} variant="outline" className="px-6">
        {CREATE_NOTE_BTN_LABEL}
      </Button>
    </div>
  );

  return (
    <div className="anim-fade size-full flex flex-col gap-2">
      {/* Header */}
      <Card className="min-h-14 px-3">
        <div className="flex flex-1 items-center gap-3">
          <NavBack route="/notes" />

          {folderData ? (
            <>
              <div style={{ color: folderColor ?? 'inherit' }}>
                <FolderFilledIcon />
              </div>

              <div
                onClick={() => setIsDialogOpen(true)}
                className="text-xl font-black cursor-pointer"
                title={EDIT_TITLE}
              >
                {folderData.title}
              </div>
            </>
          ) : null}
        </div>

        <Taskbar loading={creatingNote}>
          {removeFolderPrompt ? (
            <TaskbarPrompt
              onAccept={handleRemoveFolderAccept}
              onDecline={handleRemoveFolderDecline}
              loading={removingFolder}
            />
          ) : (
            <>
              <div
                onClick={handleCreateNote}
                className="ml-1 text-icon cursor-pointer scale-90 trans-c"
                title={CREATE_NOTE_TITLE}
              >
                <FilePlusIcon />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div
                    className="ml-1 icon--action scale-90"
                    title={EDIT_FOLDER_DIALOG_TITLE}
                  >
                    <EditIcon />
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{EDIT_FOLDER_DIALOG_TITLE}</DialogTitle>
                    <DialogDescription>
                      {EDIT_FOLDER_DIALOG_DESCRIPTION}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className={cn('w-full', updatingFolder && 'inactive')}
                    >
                      <div className="mb-6 flex gap-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <FormInput className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-30">
                                    <SelectValue
                                      placeholder={
                                        EDIT_FOLDER_FORM_COLOR_PLACEHOLDER
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    {folderColors.map(([key]) => {
                                      const color = getFolderColorByKey(
                                        key,
                                        resolvedTheme as Theme
                                      );
                                      return (
                                        <SelectItem key={key} value={key}>
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color }}
                                          />
                                          {key.charAt(0).toUpperCase() +
                                            key.slice(1)}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          type="submit"
                          loading={updatingFolder}
                          className="px-6"
                        >
                          {EDIT_FOLDER_DIALOG_ACCEPT_BTN_LABEL}
                        </Button>
                        <DialogClose asChild>
                          <Button variant="outline" className="px-6">
                            {CANCEL_BUTTON_LABEL}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <div
                onClick={handleRemoveFolder}
                className="ml-1 icon--action scale-90"
                title={DELETE_FOLDER_TITLE}
              >
                <TrashIcon />
              </div>
            </>
          )}
        </Taskbar>
      </Card>

      <PageContentBox>
        {isFolderNotesFetching ? (
          <Loading className="mt-8" delay={1000} />
        ) : folderNotes.length ? (
          <NoteList className="mb-5" folders={folders} notes={folderNotes} />
        ) : (
          createNoteBtn
        )}

        <div className="flex-center p-3">
          <FolderList
            delay={300}
            small
            activeFolderId={folderId ?? undefined}
          />
        </div>
      </PageContentBox>
    </div>
  );
}
