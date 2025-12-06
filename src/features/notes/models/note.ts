import { Schema } from 'mongoose';

import { Note } from '@/features/notes/types';
import { DBKey, mongoDB } from '@/lib/mongo';

const noteSchema = new Schema<Note>(
  {
    content: { type: String },
    folderId: { type: String, required: true },
    tags: [{ type: String }],
    timestamp: { type: Number, required: true },
    title: { type: String, required: true },
    userId: { type: String, required: true },
    encrypted: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  {
    versionKey: false,
  }
);

const getNoteModel = async () => {
  // Ensure connection exists for DB_NOTES
  await mongoDB.connect(DBKey.DB_NOTES);

  // Get the connection for DB_NOTES
  const connection = mongoDB.getConnection(DBKey.DB_NOTES);

  if (!connection) {
    throw new Error('Database connection not established for DB_NOTES');
  }

  // Use the connection's models or create model on that connection
  return connection.models.Note || connection.model('Note', noteSchema);
};

export default getNoteModel;
