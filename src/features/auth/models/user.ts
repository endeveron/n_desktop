import { Schema } from 'mongoose';

import { mongoDB } from '@/lib/mongo';
import { User, UserRole } from '@/types/user';

const userSchema = new Schema<User>(
  {
    id: { type: String },
    name: { type: String },
    email: { type: String, required: true },
    emailConfirmed: { type: Boolean, default: false },
    password: { type: String },
    role: { type: String, enum: UserRole, default: UserRole.user },
    image: { type: String },
  },
  {
    versionKey: false,
  }
);

const getUserModel = async () => {
  // Ensure connection exists
  await mongoDB.connect();

  // Get the connection for DB_BASE
  const connection = mongoDB.getConnection();

  if (!connection) {
    throw new Error('Database connection not established for DB_BASE');
  }

  // Use the connection's models or create model on that connection
  return connection.models.User || connection.model('User', userSchema);
};

export default getUserModel;
