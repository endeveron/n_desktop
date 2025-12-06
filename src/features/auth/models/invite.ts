import { Schema } from 'mongoose';

import { Invite } from '@/features/auth/types';
import { DBKey, mongoDB } from '@/lib/mongo';

const inviteSchema = new Schema<Invite>(
  {
    code: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: { type: Number },
  },
  {
    versionKey: false,
  }
);

const getInviteModel = async () => {
  // Ensure connection exists
  await mongoDB.connect(DBKey.DB_BASE);

  // Get the connection for DB_BASE
  const connection = mongoDB.getConnection(DBKey.DB_BASE);

  if (!connection) {
    throw new Error('Database connection not established for DB_BASE');
  }

  // Use the connection's models or create model on that connection
  return connection.models.Invite || connection.model('Invite', inviteSchema);
};

export default getInviteModel;
