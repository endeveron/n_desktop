'use server';

import { FolderColorKey } from '@/features/notes/maps';
import getFolderModel from '@/features/notes/models/folder';
import getNoteModel from '@/features/notes/models/note';
import { FolderDB, FolderItem, NoteDB, NoteItem } from '@/features/notes/types';
import { parseFolderItem, parseNoteItem } from '@/features/notes/utils';
import { decryptString, encryptString } from '@/lib/crypto';
import { ServerActionResult } from '@/types';
import { handleActionError } from '@/utils/error';

export const getFolders = async ({
  userId,
}: {
  userId: string;
}): Promise<
  ServerActionResult<{
    folders: FolderItem[];
    favoriteNotes: NoteItem[];
  }>
> => {
  if (!userId) {
    return handleActionError('getFolders: Missing required data');
  }

  try {
    const FolderModel = await getFolderModel();

    const folderDocs = await FolderModel.find<FolderDB>({ userId });
    const parsedFolders: FolderItem[] = folderDocs.map((d) => ({
      id: d._id.toString(),
      color: d.color,
      tags: d.tags,
      timestamp: d.timestamp,
      title: d.title,
    }));

    const NoteModel = await getNoteModel();

    const favNoteDocs = await NoteModel.find<NoteDB>({
      userId,
      favorite: true,
    });
    const parsedFavNotes = favNoteDocs.map((n) => parseNoteItem(n));

    return {
      success: true,
      data: {
        favoriteNotes: parsedFavNotes,
        folders: parsedFolders,
      },
    };
  } catch (err: unknown) {
    return handleActionError('getFolders: Unable to retrieve folders', err);
  }
};

export const getFolder = async ({
  id,
}: {
  id: string;
}): Promise<ServerActionResult<NoteItem[]>> => {
  if (!id) {
    return handleActionError('getFolder: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDocs = await NoteModel.find<NoteDB>({ folderId: id });

    if (!noteDocs.length) {
      return {
        success: true,
        data: [],
      };
    }

    const noteItems: NoteItem[] = noteDocs.map((d) => parseNoteItem(d));

    return {
      success: true,
      data: noteItems,
    };
  } catch (err: unknown) {
    return handleActionError('getFolder: Unable to retrieve folder data', err);
  }
};

export const deleteFolder = async ({
  folderId,
}: {
  folderId: string;
}): Promise<ServerActionResult> => {
  if (!folderId) {
    return handleActionError('postFolder: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();
    const FolderModel = await getFolderModel();

    // Delete related notes
    await NoteModel.deleteMany({ folderId });

    // Delete folder
    await FolderModel.findByIdAndDelete(folderId);

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('postFolder: Unable to create folder', err);
  }
};

export const patchFolder = async ({
  folderId,
  color,
  title,
}: {
  folderId: string;
  color?: FolderColorKey;
  title?: string;
}): Promise<ServerActionResult<FolderItem>> => {
  if (!folderId) {
    return handleActionError('patchFolder: Missing required data');
  }

  try {
    const FolderModel = await getFolderModel();

    const folderDoc = await FolderModel.findById(folderId);
    if (!folderDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    // Update properties
    if (color && color !== folderDoc.color) {
      folderDoc.color = color;
    }
    if (title && title !== folderDoc.title) {
      folderDoc.title = title;
    }

    await folderDoc.save();

    return {
      success: true,
      data: parseFolderItem(folderDoc),
    };
  } catch (err: unknown) {
    return handleActionError('patchFolder: Unable to update folder', err);
  }
};

export const postFolder = async ({
  userId,
}: {
  userId: string;
}): Promise<ServerActionResult<FolderItem>> => {
  if (!userId) {
    return handleActionError('postFolder: Missing required data');
  }

  try {
    const initialData = {
      color: 'gray' as FolderColorKey,
      tags: [],
      timestamp: Date.now(),
      title: 'Untitled',
      userId,
    };

    const FolderModel = await getFolderModel();

    const folder = await FolderModel.create(initialData);

    return {
      success: true,
      data: {
        id: folder._id.toString(),
        ...initialData,
      },
    };
  } catch (err: unknown) {
    return handleActionError('postFolder: Unable to create folder', err);
  }
};

export const getNote = async ({
  noteId,
}: {
  noteId: string;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!noteId) {
    return handleActionError('getNote: Missing mote id');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    return {
      success: true,
      data: parseNoteItem(noteDoc),
    };
  } catch (err: unknown) {
    return handleActionError('getNote: Unable to retrieve note', err);
  }
};
export const patchNote = async ({
  noteId,
  content,
  title,
}: {
  noteId: string;
  content?: string;
  title?: string;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!noteId || (!content && !title)) {
    return handleActionError('patchNote: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    // Update properties
    if (content !== noteDoc.content) {
      noteDoc.content = content;
    }
    if (!content && noteDoc.encrypted) {
      noteDoc.encrypted = false;
    }
    if (title && title !== noteDoc.title) {
      noteDoc.title = title;
    }

    await noteDoc.save();

    return {
      success: true,
      data: parseNoteItem(noteDoc),
    };
  } catch (err: unknown) {
    return handleActionError('patchNote: Unable to update note', err);
  }
};

export const getNoteDecrypt = async ({
  noteId,
}: {
  noteId: string;
}): Promise<ServerActionResult<string>> => {
  if (!noteId) {
    return handleActionError('getNoteDecrypt: Missing note id');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    const content = noteDoc.content;
    if (!content) {
      return {
        success: false,
        error: {
          message: 'Missing note content to decrypt',
        },
      };
    }

    // Decrypt content
    const decryptedContent = decryptString(content);

    return {
      success: true,
      data: decryptedContent,
    };
  } catch (err: unknown) {
    return handleActionError('getNoteDecrypt: Unable to decrypt note', err);
  }
};

export const patchNoteDecrypt = async ({
  noteId,
}: {
  noteId: string;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!noteId) {
    return handleActionError('patchNoteDecrypt: Missing note id');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    const content = noteDoc.content;
    if (!content) {
      return {
        success: false,
        error: {
          message: 'Missing note content to decrypt',
        },
      };
    }

    // Decrypt content and update note document
    noteDoc.content = decryptString(content);
    noteDoc.encrypted = false;
    await noteDoc.save();

    return {
      success: true,
      data: parseNoteItem(noteDoc),
    };
  } catch (err: unknown) {
    return handleActionError('patchNoteDecrypt: Unable to decrypt note', err);
  }
};

export const patchNoteEncrypt = async ({
  noteId,
  content,
  title,
}: {
  noteId: string;
  content: string;
  title?: string;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!noteId || !content) {
    return handleActionError('patchNoteEncrypt: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    // Encrypt content
    const encryptedContent = encryptString(content);

    // Update note document
    if (title && title !== noteDoc.title) {
      noteDoc.title = title;
    }
    noteDoc.content = encryptedContent;
    noteDoc.encrypted = true;
    await noteDoc.save();

    return {
      success: true,
      data: parseNoteItem(noteDoc),
    };
  } catch (err: unknown) {
    return handleActionError('patchNoteEncrypt: Unable to encrypt note', err);
  }
};

export const patchNoteFavorite = async ({
  noteId,
  favorite,
}: {
  noteId: string;
  favorite: boolean;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!noteId || typeof favorite !== 'boolean') {
    return handleActionError('patchNoteFavorite: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    noteDoc.favorite = favorite;
    await noteDoc.save();

    return {
      success: true,
      data: parseNoteItem(noteDoc),
    };
  } catch (err: unknown) {
    return handleActionError('patchNoteFavorite: Unable to encrypt note', err);
  }
};

export const patchNoteMove = async ({
  folderId,
  noteId,
}: {
  folderId: string;
  noteId: string;
}): Promise<ServerActionResult> => {
  if (!folderId || !noteId) {
    return handleActionError('patchNoteMove: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();

    const noteDoc = await NoteModel.findById(noteId);
    if (!noteDoc) {
      return {
        success: false,
        error: {
          message: 'Not found',
        },
      };
    }

    // Update note document
    noteDoc.folderId = folderId;
    // noteDoc.timestamp = Date.now();
    await noteDoc.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('patchNoteMove: Unable to move note', err);
  }
};

export const postNote = async ({
  folderId,
  userId,
}: {
  folderId: string;
  userId: string;
}): Promise<ServerActionResult<NoteItem>> => {
  if (!folderId || !userId) {
    return handleActionError('postNote: Missing required data');
  }

  try {
    const initialData = {
      content: '',
      encrypted: false,
      favorite: false,
      folderId,
      tags: [],
      timestamp: Date.now(),
      title: 'Untitled',
    };

    const NoteModel = await getNoteModel();

    const note = await NoteModel.create({
      ...initialData,
      userId,
    });

    const noteItem = {
      id: note._id.toString(),
      ...initialData,
    };

    return {
      success: true,
      data: noteItem,
    };
  } catch (err: unknown) {
    return handleActionError('postNote: Unable to create note', err);
  }
};

export const deleteNote = async ({
  noteId,
}: {
  noteId: string;
}): Promise<ServerActionResult> => {
  if (!noteId) {
    return handleActionError('deleteNote: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();
    await NoteModel.findByIdAndDelete(noteId);

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('deleteNote: Unable to delete note', err);
  }
};

export const getFolderNotes = async ({
  folderId,
  userId,
}: {
  folderId: string;
  userId: string;
}): Promise<ServerActionResult<NoteItem[]>> => {
  if (!userId) {
    return handleActionError('getFolderNotes: Missing required data');
  }

  try {
    const NoteModel = await getNoteModel();
    const noteDocs = await NoteModel.find<NoteDB>({ folderId, userId });
    const noteItems: NoteItem[] = noteDocs.map((d) => parseNoteItem(d));

    return {
      success: true,
      data: noteItems,
    };
  } catch (err: unknown) {
    return handleActionError('getFolderNotes: Unable to retrieve notes', err);
  }
};
