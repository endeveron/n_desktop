import { StateCreator } from 'zustand';

import {
  deleteFolder,
  deleteNote,
  getFolderNotes,
  getFolders,
  getNote,
  getNoteDecrypt,
  patchFolder,
  patchNote,
  patchNoteDecrypt,
  patchNoteEncrypt,
  patchNoteFavorite,
  patchNoteMove,
  postFolder,
  postNote,
} from '@/features/notes/actions';
import { FolderColorKey } from '@/features/notes/maps';
import { FolderItem, NoteItem } from '@/features/notes/types';
import { updateFolderNotes, updateFolders } from '@/features/notes/utils';
import { initialState } from '@/store';
import { ServerActionResult } from '@/types';
import { logWithTime } from '@/utils';

export interface NotesSlice {
  isNotesError: boolean;
  isNotesInitialized: boolean;
  notesTimestamp: number | null;
  resetNotesInitialized: () => void;

  // Notes
  isFolderNotesError: boolean;
  isFolderNotesFetching: boolean;
  creatingNote: boolean;
  favoriteNotes: NoteItem[];
  folderNotes: NoteItem[];
  movingNote: boolean;
  notes: NoteItem[];
  removingNote: boolean;
  updatingNote: boolean;
  createNote: (args: {
    folderId: string;
    userId: string;
  }) => Promise<ServerActionResult<NoteItem>>;
  decryptNote: (args: {
    noteId: string;
  }) => Promise<ServerActionResult<string>>;
  decryptNoteInDB: (args: { noteId: string }) => Promise<ServerActionResult>;
  encryptNote: (args: {
    noteId: string;
    content: string;
    title?: string;
  }) => Promise<ServerActionResult>;
  fetchFolderNotes: (args: {
    folderId: string;
    userId: string;
  }) => Promise<boolean>;
  fetchNote: (args: {
    noteId: string;
  }) => Promise<ServerActionResult<NoteItem>>;
  moveNote: (args: {
    noteId: string;
    folderId: string;
  }) => Promise<ServerActionResult>;
  removeNote: (args: { noteId: string }) => Promise<ServerActionResult>;
  updateNote: (args: {
    noteId: string;
    content?: string;
    title?: string;
  }) => Promise<ServerActionResult>;
  updateNoteFavorite: (args: {
    noteId: string;
    favorite: boolean;
  }) => Promise<ServerActionResult>;
  updateFavoriteNotes: (args: { note: NoteItem }) => void;

  // Folders
  creatingFolder: boolean;
  fetchingFolders: boolean;
  folderId: string | null;
  folders: FolderItem[];
  removingFolder: boolean;
  updatingFolder: boolean;

  createFolder: (args: {
    userId: string;
  }) => Promise<ServerActionResult<{ id: string }>>;
  fetchFolders: (args: { userId: string }) => Promise<boolean>;
  removeFolder: (args: {
    folderId: string;
    userId: string;
  }) => Promise<ServerActionResult>;
  setFolderId: (folderId: string | null) => void;
  updateFolder: (args: {
    folderId: string;
    userId: string;
    color?: FolderColorKey;
    title?: string;
  }) => Promise<ServerActionResult>;
}

export const notesSlice: StateCreator<NotesSlice, [], [], NotesSlice> = (
  set,
  get
) => ({
  ...initialState,

  resetNotesInitialized: () => set({ isNotesInitialized: false }),

  // Notes
  createNote: async ({ folderId, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }

    set({ creatingNote: true });
    const res = await postNote({ folderId, userId });
    if (res.success && res.data?.id) {
      // Add the note to the folderNotes array in the local state
      set({ folderNotes: [...get().folderNotes, res.data] });
    }
    set({ creatingNote: false });
    return res;
  },

  decryptNote: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ updatingNote: true });
    const res = await getNoteDecrypt({ noteId });

    if (!res.success && res.error) {
      logWithTime(
        `decryptNote: ${res.error.message ?? 'Unable to decrypt note'}`
      );
    }

    // No need to refresh folder notes
    set({ updatingNote: false });
    return res;
  },

  decryptNoteInDB: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteDecrypt({ noteId });
    if (res.success && res.data?.content) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  encryptNote: async ({ noteId, content, title }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (!content) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteEncrypt({ noteId, content, title });
    if (res.success && res.data?.content) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  fetchFolderNotes: async ({ folderId, userId }) => {
    const { isFolderNotesFetching } = get() as NotesSlice;
    if (isFolderNotesFetching) {
      return true;
    }

    if (!folderId || !userId) {
      return false;
    }

    set({
      isFolderNotesError: false,
      isFolderNotesFetching: true,
    });

    const res = await getFolderNotes({ folderId, userId });

    if (!res.success && res.error) {
      logWithTime(
        `fetchFolderNotes: ${res.error.message ?? 'Unable to retrieve data'}`
      );
    }

    if (res.success && res.data) {
      set({
        folderNotes: res.data,
        isFolderNotesFetching: false,
      });
      return true;
    }
    set({
      isFolderNotesError: true,
      isFolderNotesFetching: false,
    });
    return false;
  },

  fetchNote: async ({ noteId }) => {
    if (!noteId)
      return {
        success: false,
        error: { message: 'Missing note id' },
      };

    const res = await getNote({ noteId });
    return res;
  },

  moveNote: async ({ folderId, noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ movingNote: true });
    const res = await patchNoteMove({ folderId, noteId });
    if (res.success) {
      // Remove the note from the folderNotes array
      const updFolderNotes = [...get().folderNotes].filter(
        (n) => n.id !== noteId
      );
      set({ folderNotes: updFolderNotes });
    }
    set({ movingNote: false });
    return res;
  },

  removeNote: async ({ noteId }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }

    set({ removingNote: true });
    const res = await deleteNote({ noteId });
    if (res.success) {
      // Remove the note from the folderNotes array
      set({
        folderNotes: [...get().folderNotes].filter((n) => n.id !== noteId),
      });

      // Check favoriteNotes array
      const favoriteNotes = get().favoriteNotes;
      if (favoriteNotes.length) {
        const index = favoriteNotes.findIndex((n) => n.id === noteId);
        if (index !== -1) {
          // Remove the note from the favoriteNotes array
          const updFavNotes = [...favoriteNotes];
          updFavNotes.splice(index, 1);
          set({ favoriteNotes: updFavNotes });
        }
      }
    }
    set({ removingNote: false });
    return res;
  },

  updateNote: async ({ noteId, content, title }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (!content && !title) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNote({ noteId, content, title });
    if (res.success && res.data?.id) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });
    }
    set({ updatingNote: false });
    return res;
  },

  updateNoteFavorite: async ({ noteId, favorite }) => {
    if (!noteId) {
      return { success: false, error: { message: 'Missing note id' } };
    }
    if (typeof favorite !== 'boolean') {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingNote: true });
    const res = await patchNoteFavorite({ noteId, favorite });
    if (res.success && res.data?.id) {
      // Update the note in the folderNotes array
      set({
        folderNotes: updateFolderNotes({
          folderNotes: get().folderNotes,
          note: res.data,
        }),
      });

      let updFavoriteNotes: NoteItem[];

      // Update favorite notes array
      updFavoriteNotes = [...get().favoriteNotes];
      const indexFav = updFavoriteNotes.findIndex((n) => n.id === noteId);

      if (favorite && indexFav === -1) {
        // Add the note to the favorites array
        updFavoriteNotes.push(res.data);
        updFavoriteNotes.sort((a, b) => a.title.localeCompare(b.title));
        set({ favoriteNotes: updFavoriteNotes });
      }

      if (!favorite && indexFav !== -1) {
        // Remove the note from the favorites array
        updFavoriteNotes = [...get().folderNotes].filter(
          (n) => n.id !== noteId
        );
        set({ favoriteNotes: updFavoriteNotes });
      }
    }
    set({ updatingNote: false });
    return res;
  },

  updateFavoriteNotes: ({ note }) => {
    const updFavoriteNotes = [...get().favoriteNotes];
    const index = updFavoriteNotes.findIndex((n) => n.id === note.id);
    if (index === -1) return;
    updFavoriteNotes[index] = note;
    set({ favoriteNotes: updFavoriteNotes });
  },

  // Folders
  createFolder: async ({ userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }

    set({ creatingFolder: true });
    const res = await postFolder({ userId });
    if (res.success && res.data?.id) {
      // Add the folder to the folders array
      set({ folders: [...get().folders, res.data] });
    }
    set({ creatingFolder: false });
    return res;
  },

  setFolderId: (folderId) => {
    set({ folderId });
  },

  updateFolder: async ({ color, folderId, title, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }
    if (!color && !title) {
      return { success: false, error: { message: 'Missing required data' } };
    }

    set({ updatingFolder: true });
    const res = await patchFolder({ color, folderId, title });
    if (res.success && res.data?.id) {
      // Update the folder in the folders array
      const updFolders = updateFolders({
        folders: get().folders,
        folder: res.data,
      });
      set({ folders: updFolders });
    }
    set({ updatingFolder: false });
    return res;
  },

  removeFolder: async ({ folderId, userId }) => {
    if (!userId) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    if (!folderId) {
      return { success: false, error: { message: 'Missing folder id' } };
    }

    set({ removingFolder: true });
    const res = await deleteFolder({ folderId });
    if (res.success) {
      // Remove the folder from the folders array
      set({ folders: [...get().folders].filter((f) => f.id !== folderId) });
    }
    set({ removingFolder: false });
    return res;
  },

  fetchFolders: async ({ userId }) => {
    const { fetchingFolders, isNotesInitialized } = get() as NotesSlice;
    if (!userId || isNotesInitialized) {
      return false;
    }
    if (fetchingFolders) {
      return true;
    }

    set({
      fetchingFolders: true,
      isNotesError: false,
      isNotesInitialized: true,
    });

    const res = await getFolders({ userId });

    if (!res.success && res.error) {
      logWithTime(
        `fetchFolders: ${res.error.message ?? 'Unable to retrieve data'}`
      );
    }

    if (res.success && res.data) {
      set({
        fetchingFolders: false,
        folders: res.data.folders,
        favoriteNotes: res.data.favoriteNotes,
        notesTimestamp: Date.now(),
        isNotesError: false,
      });
      return true;
    }

    set({
      fetchingFolders: false,
      isNotesError: true,
    });
    return false;
  },
});
