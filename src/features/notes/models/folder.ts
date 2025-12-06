import { Schema } from 'mongoose';

import { Folder } from '@/features/notes/types';
import { DBKey, mongoDB } from '@/lib/mongo';

const folderSchema = new Schema<Folder>(
  {
    color: { type: String },
    tags: [{ type: String }],
    timestamp: { type: Number, required: true },
    title: { type: String, required: true },
    userId: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const getFolderModel = async () => {
  // Ensure connection exists
  await mongoDB.connect(DBKey.DB_NOTES);

  // Get the connection for DB_NOTES
  const connection = mongoDB.getConnection(DBKey.DB_NOTES);

  if (!connection) {
    throw new Error('Database connection not established for DB_NOTES');
  }

  // Use the connection's models or create model on that connection
  return connection.models.Folder || connection.model('Folder', folderSchema);
};

export default getFolderModel;
