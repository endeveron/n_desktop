import { Schema } from 'mongoose';

import { FactDB } from '@/features/facts/types';
import { mongoDB } from '@/lib/mongo';

const factSchema = new Schema<FactDB>(
  {
    category: {
      type: String,
      required: [true, 'Please select a category.'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a fact.'],
      minlength: [10, 'Fact title cannot contain less than 10 characters'],
      maxlength: [100, 'Fact title cannot contain more than 100 characters'],
    },
  },
  {
    versionKey: false,
  }
);

const getFactModel = async () => {
  // Ensure connection exists
  await mongoDB.connect();

  // Get the default connection (DB_BASE)
  const connection = mongoDB.getConnection();

  if (!connection) {
    throw new Error('Database connection not established for DB_BASE');
  }

  // Use the connection's models or create model on that connection
  return connection.models.Fact || connection.model('Fact', factSchema);
};

export default getFactModel;
