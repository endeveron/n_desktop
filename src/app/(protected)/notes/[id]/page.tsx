'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import 'highlight.js/styles/github-dark.css';
import { Lock, LockOpen } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

import { AcceptIcon } from '@/components/icons/AcceptIcon';
import { ClearIcon } from '@/components/icons/ClearIcon';
import { EditIcon } from '@/components/icons/EditIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { FileIcon } from '@/components/icons/FileIcon';
import { LockIcon } from '@/components/icons/LockIcon';
import { SaveIcon } from '@/components/icons/SaveIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { UnlockIcon } from '@/components/icons/UnlockIcon';
import { Button } from '@/components/shadcn/Button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormMessage,
  FormTextarea,
} from '@/components/shadcn/Form';
import { Card } from '@/components/shared/Card';
import Loading from '@/components/shared/Loading';
import { NavBack } from '@/components/shared/NavBack';
import { PageContentBox } from '@/components/shared/PageContentBox';
import Taskbar from '@/components/shared/Taskbar';
import TaskbarPrompt from '@/components/shared/TaskbarPrompt';
import { useSessionClient } from '@/features/auth/hooks/useSessionClient';
import FolderList from '@/features/notes/components/FolderList';
import { MoveNoteDropdown } from '@/features/notes/components/MoveNoteDropdown';
import {
  updateNoteContentSchema,
  UpdateNoteContentSchema,
  updateNoteTitleSchema,
  UpdateNoteTitleSchema,
} from '@/features/notes/schemas';
import { NoteItem, TargetFolderData } from '@/features/notes/types';
import { useClipboard } from '@/hooks/useClipboard';
import { useStore } from '@/store';
import {
  CLEAR_NOTE_TITLE,
  DECRYPT_IN_DB_TITLE,
  DECRYPTING_NOTE_MESSAGE,
  DELETE_NOTE_TITLE,
  EDIT_MODE_TITLE,
  EDIT_TITLE,
  ENCRYPT_NOTE_TITLE,
  PASTE_CONTENT_BTN_LABEL,
  PREVIEW_MODE_TITLE,
  SAVE_CHANGES_TITLE,
  TOAST_NOTE_DECRYPTED,
  TOAST_NOTE_ENCRYPTED,
  TOAST_NOTE_MOVED_END,
  TOAST_NOTE_MOVED_START,
} from '@/translations/en';
import { ServerActionResult } from '@/types';
import { cn } from '@/utils';

export default function NotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { paste } = useClipboard();
  const { userId } = useSessionClient();

  const decryptNote = useStore((s) => s.decryptNote);
  const decryptNoteInDB = useStore((s) => s.decryptNoteInDB);
  const encryptNote = useStore((s) => s.encryptNote);
  const favoriteNotes = useStore((s) => s.favoriteNotes);
  const fetchNote = useStore((s) => s.fetchNote);
  const folderNotes = useStore((s) => s.folderNotes);
  const folders = useStore((s) => s.folders);
  const moveNote = useStore((s) => s.moveNote);
  const movingNote = useStore((s) => s.movingNote);
  const removeNote = useStore((s) => s.removeNote);
  const removingNote = useStore((s) => s.removingNote);
  const updateNote = useStore((s) => s.updateNote);
  const updatingNote = useStore((s) => s.updatingNote);
  const updateFavoriteNotes = useStore((s) => s.updateFavoriteNotes);

  const [note, setNote] = useState<NoteItem | null>(null);
  const [removeNotePrompt, setRemoveNotePrompt] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveAllowed, setSaveAllowed] = useState(false);

  const statusFromSearchParams = searchParams.get('status');
  const isNewNote = statusFromSearchParams === 'new';
  const modeFromSearchParams = searchParams.get('mode');
  const enableEditMode = modeFromSearchParams === 'edit';

  const titleForm = useForm<UpdateNoteTitleSchema>({
    resolver: zodResolver(updateNoteTitleSchema),
    defaultValues: {
      title: '',
    },
  });

  const contentForm = useForm<UpdateNoteContentSchema>({
    resolver: zodResolver(updateNoteContentSchema),
    defaultValues: {
      content: '',
    },
  });
  const title = titleForm.watch('title');
  const content = contentForm.watch('content');

  const folderId = note && note.folderId;
  const titleIsDirty = titleForm.formState.isDirty;
  const contentIsDirty = contentForm.formState.isDirty;
  const contentIsEmpty = note && !note.content && !content;
  const contentIsEncrypted = note && note.encrypted;
  const contentIsDecrypted = note && note.decrypted;

  const noteId = useMemo(() => {
    const pathArr = pathname.split('/');
    return pathArr.includes('notes') ? pathArr[2] : null;
  }, [pathname]);

  const handleToggleMode = () => {
    if (contentIsEncrypted) return;

    if (editMode) {
      // When switching from edit to view, update the note with current form values
      const currentContent = contentForm.getValues('content');
      const currentTitle = titleForm.getValues('title');

      setNote((prev) =>
        prev
          ? {
              ...prev,
              content: currentContent,
              title: currentTitle,
            }
          : null
      );
    }

    setEditMode((prev) => !prev);
  };

  const handlePasteContent = async () => {
    const content = await paste();
    if (content) {
      setEditMode(true);
      contentForm.setValue('content', content);
      setSaveAllowed(true);
    }
  };

  const handleClearContent = () => {
    contentForm.setValue('content', '');
    setNote((prev) =>
      prev
        ? {
            ...prev,
            content: '',
          }
        : null
    );
    setSaveAllowed(true);
  };

  const handleEncryptNote = async () => {
    if (!userId || !noteId || contentIsEmpty) return;

    const res = await encryptNote({
      noteId,
      title,
      content,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to encrypt note');
      return;
    }

    toast(
      <div className="flex items-center gap-3">
        <Lock className="scale-80 text-success" />
        <div>{TOAST_NOTE_ENCRYPTED}</div>
      </div>
    );
  };

  const handleDecryptNoteInDB = async () => {
    if (!userId || !noteId) return;

    const res = await decryptNoteInDB({
      noteId,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to decrypt note in db');
      return;
    }

    toast(
      <div className="flex items-center gap-3">
        <LockOpen className="scale-80 text-warning" />
        <div>{TOAST_NOTE_DECRYPTED}</div>
      </div>
    );
  };

  const handleSaveNote = async () => {
    if (!userId || !note || !noteId || !folderId) return;

    const title = titleForm.getValues('title');
    const content = contentForm.getValues('content');

    // Validate both forms
    const titleValid = await titleForm.trigger();
    const contentValid = await contentForm.trigger();

    if (!titleValid || !contentValid) return;

    const noteData: {
      folderId: string;
      noteId: string;
      content?: string;
      title?: string;
    } = {
      content,
      folderId,
      noteId,
      title,
    };

    let res: ServerActionResult;

    // If content is been decrypted locally
    if (contentIsDecrypted) {
      res = await encryptNote({
        ...noteData,
        content,
      });
    } else {
      res = await updateNote(noteData);
    }

    if (!res.success) {
      toast(res.error.message ?? 'Unable to update note');
      return;
    }

    setNote((prev) =>
      prev
        ? {
            ...prev,
            content,
            title,
          }
        : null
    );
    setEditMode(false);
    if (saveAllowed) setSaveAllowed(false);

    // Update note in favoriteNotes array
    if (favoriteNotes.length) {
      updateFavoriteNotes({
        note: {
          ...note,
          content,
          title,
        },
      });
    }
  };

  const handleMoveNote = async ({
    folderId,
    folderTitle,
  }: TargetFolderData) => {
    if (!note) return;

    const res = await moveNote({ folderId, noteId: note.id });

    let toastContent = <span>Unable to move note</span>;

    if (res.success) {
      toastContent = (
        <div className="flex items-center gap-3">
          <AcceptIcon className="text-success" />
          <span>
            {`${TOAST_NOTE_MOVED_START} "${folderTitle}" ${TOAST_NOTE_MOVED_END}`}
          </span>
        </div>
      );
    }

    toast(toastContent);

    setNote((prev) =>
      prev
        ? {
            ...prev,
            folderId,
          }
        : null
    );
  };

  const handleRemoveNote = () => {
    setRemoveNotePrompt(true);
  };

  const handleRemoveNoteAccept = async () => {
    if (!userId || !noteId) return;

    setRemoveNotePrompt(true);
    const res = await removeNote({ noteId });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to delete note');
      setRemoveNotePrompt(false);
      return;
    }

    setRemoveNotePrompt(false);
    router.replace(`/notes/folder/${folderId}`);
  };

  const handleRemoveNoteDecline = () => {
    setRemoveNotePrompt(false);
  };

  const decryptNoteContentLocally = useCallback(async () => {
    if (!userId || !noteId) return;

    const res = await decryptNote({
      noteId,
    });

    if (!res.success) {
      toast(res.error.message ?? 'Unable to decrypt note content locally');
      return;
    }

    if (!res.data) {
      toast('Unable to decrypt note content');
      return;
    }

    const decryptedContent = res.data;

    (async () => {
      setNote((prev) =>
        prev
          ? {
              ...prev,
              content: decryptedContent,
              encrypted: false,
              decrypted: true,
            }
          : null
      );
    })();
  }, [decryptNote, noteId, userId]);

  // Auto-decrypt content
  useEffect(() => {
    if (contentIsEncrypted && !contentIsDecrypted) {
      decryptNoteContentLocally();
    }
  }, [contentIsEncrypted, contentIsDecrypted, decryptNoteContentLocally]);

  // Initialize note data
  useEffect(() => {
    if (!noteId) return;

    // Search note in the folderNotes array
    const noteFromFolderNotes =
      folderNotes.length && folderNotes.find((n) => n.id === noteId);
    if (noteFromFolderNotes) {
      setNote(noteFromFolderNotes);
      return;
    }

    // Check favoriteNotes array
    const noteFromFavoriteNotes = favoriteNotes.find((n) => n.id === noteId);
    if (noteFromFavoriteNotes) {
      setNote(noteFromFavoriteNotes);
      return;
    }

    // Fetch from server as last resort
    (async () => {
      const res = await fetchNote({ noteId });
      if (!res.success || !res.data?.id) {
        return;
      }

      setNote(res.data);
    })();

    // Don't include `note` in the deps array - when update note state
    // in handleToggleMode, this effect runs again and overwrites
    // changes with the original folderNotes[index] value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderNotes, noteId]);

  // Reset titleForm and contentForm
  useEffect(() => {
    if (!note) return;

    titleForm.reset({
      title: note.title,
    });

    contentForm.reset({
      content: note.content,
    });
  }, [contentForm, note, titleForm]);

  // Auto switch to edit mode for new note
  useEffect(() => {
    if (enableEditMode || isNewNote) {
      setEditMode(true);
    }
  }, [enableEditMode, isNewNote]);

  // Auto switch to edit mode if content is empty
  useEffect(() => {
    if (note && !note.content) {
      setEditMode(true);
    }
  }, [note]);

  const pasteContentBtn = !contentIsDirty ? (
    <div className="my-3 anim-fade w-full text-center">
      <Button onClick={handlePasteContent} variant="outline" className="px-6">
        {PASTE_CONTENT_BTN_LABEL}
      </Button>
    </div>
  ) : null;

  return (
    <div className="anim-fade size-full flex flex-col gap-2">
      {/* Header */}
      <Card className="min-h-14 px-3">
        <div className="flex flex-1 items-center gap-3 mr-2">
          <NavBack />

          {note && editMode ? (
            <Form {...titleForm}>
              <form
                className={cn('anim-fade w-full', updatingNote && 'inactive')}
              >
                <FormField
                  control={titleForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <FormInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : null}

          {note && !editMode ? (
            <div
              onClick={handleToggleMode}
              className="anim-fade flex items-center gap-2 min-w-0 cursor-pointer"
              title="Click to edit"
            >
              {/* Icon */}
              <div className="shrink-0 text-icon">
                {contentIsEncrypted ? <LockIcon /> : <FileIcon />}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-xl font-black truncate">{note.title}</div>
              </div>
            </div>
          ) : null}
        </div>

        <Taskbar loading={removingNote || updatingNote}>
          {removeNotePrompt ? (
            <TaskbarPrompt
              onAccept={handleRemoveNoteAccept}
              onDecline={handleRemoveNoteDecline}
              loading={removingNote}
            />
          ) : (
            <>
              {(titleIsDirty || contentIsDirty || saveAllowed) && (
                <div
                  onClick={handleSaveNote}
                  className="ml-1 text-accent cursor-pointer trans-c"
                  title={SAVE_CHANGES_TITLE}
                >
                  <SaveIcon />
                </div>
              )}

              {!!contentIsDecrypted && (
                <div
                  onClick={handleDecryptNoteInDB}
                  className="ml-1 icon--action"
                  title={DECRYPT_IN_DB_TITLE}
                >
                  <UnlockIcon />
                </div>
              )}

              {!contentIsEncrypted && !contentIsEmpty && !contentIsDecrypted ? (
                <div
                  onClick={handleEncryptNote}
                  className="ml-1 text-icon cursor-pointer"
                  title={ENCRYPT_NOTE_TITLE}
                >
                  <LockIcon />
                </div>
              ) : null}

              <div onClick={handleToggleMode} className="ml-1 icon--action">
                {editMode ? (
                  <div title={PREVIEW_MODE_TITLE}>
                    <EyeIcon />
                  </div>
                ) : (
                  <div title={EDIT_MODE_TITLE}>
                    <EditIcon />
                  </div>
                )}
              </div>

              {note && !editMode ? (
                <div className="ml-1">
                  <MoveNoteDropdown
                    currentFolderId={note.folderId}
                    folders={folders}
                    onMoveNote={handleMoveNote}
                    loading={movingNote}
                  />
                </div>
              ) : null}

              {content && editMode ? (
                <div
                  onClick={handleClearContent}
                  className="ml-1 icon--action"
                  title={CLEAR_NOTE_TITLE}
                >
                  <ClearIcon />
                </div>
              ) : null}

              <div
                onClick={handleRemoveNote}
                className="ml-1 icon--action"
                title={DELETE_NOTE_TITLE}
              >
                <TrashIcon />
              </div>
            </>
          )}
        </Taskbar>
      </Card>

      <PageContentBox>
        <Card className="min-h-14 p-3 mb-3 max-w-full">
          {note ? (
            <>
              {contentIsEncrypted ? (
                <div className="anim-fade w-full my-3 flex-center items-center gap-3 select-none">
                  <Loading />
                  <span className="text-sm text-muted">
                    {DECRYPTING_NOTE_MESSAGE}
                  </span>
                </div>
              ) : editMode ? (
                <div className="anim-fade w-full">
                  <Form {...contentForm}>
                    <form className={cn('w-full', updatingNote && 'inactive')}>
                      <FormField
                        control={contentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <FormTextarea className="" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>

                  {isNewNote && <div className="pt-3">{pasteContentBtn}</div>}
                </div>
              ) : contentIsEmpty ? (
                pasteContentBtn
              ) : (
                <article
                  onClick={handleToggleMode}
                  className="anim-fade w-full prose prose-lg dark:prose-invert max-w-none cursor-pointer"
                  title={EDIT_TITLE}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {note.content}
                  </ReactMarkdown>
                </article>
              )}
            </>
          ) : (
            <Loading className="mt-8" delay={1000} />
          )}
        </Card>

        <div className="flex-center p-3">
          <FolderList delay={300} small activeFolderId={note?.folderId} />
        </div>
      </PageContentBox>
    </div>
  );
}
