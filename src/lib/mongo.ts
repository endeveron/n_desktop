import { MongoClientOptions } from 'mongodb';
import mongoose, { ConnectOptions } from 'mongoose';

import {
  DB_BASE_CONNECTION_STRING,
  DB_NOTES_CONNECTION_STRING,
} from '@/constants';
import logger from '@/utils/logger';

export enum DBKey {
  DB_BASE = 'DB_BASE',
  DB_NOTES = 'DB_NOTES',
}

// Extend the global object with mongoose (and native client) properties
const globalWithMongo = global as typeof global & {
  _mongoose?: {
    connections: Record<DBKey, mongoose.Connection | null>;
  };
  // Native client for vector store
  // _mongoClient?: {
  //   client: MongoClient | null;
  //   db: Db | null;
  // };
};

// Initialize caches
const mongooseCache =
  globalWithMongo._mongoose ??
  (globalWithMongo._mongoose = {
    connections: {} as Record<DBKey, mongoose.Connection | null>,
  });

// const vectorCache =
//   globalWithMongo._mongoClient ??
//   (globalWithMongo._mongoClient = { client: null, db: null });

// Shared configuration
const getConnectionConfig = (
  dbKey: DBKey = DBKey.DB_BASE
): {
  uri: string;
  mongooseOptions: ConnectOptions;
  clientOptions: MongoClientOptions;
} => {
  let uri: string | undefined;

  switch (dbKey) {
    case DBKey.DB_BASE:
      uri = DB_BASE_CONNECTION_STRING;
      break;
    case DBKey.DB_NOTES:
      uri = DB_NOTES_CONNECTION_STRING;
      break;
    default:
      // Exhaustiveness check - TypeScript will error if a case is missing
      throw new Error(`MongoDB: Unknown database key: ${dbKey}`);
  }

  if (!uri) {
    throw new Error(`MongoDB: Connection string for ${dbKey} is not defined`);
  }

  const mongooseOptions: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  };

  const clientOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  return { uri, mongooseOptions, clientOptions };
};

/**
 * Establishes a connection to a MongoDB database using Mongoose.
 *
 * @param {DBKey} [dbKey=DBKey.DB_BASE] - The database key to connect to. Defaults to DB_BASE.
 * @returns {Promise<MongoDBConnectionResult>} Returns null on success, or an error message string on failure.
 *
 * @example
 * // Connect to default database (DB_BASE)
 * await mongoDB.connect();
 *
 * @example
 * // Connect to specific database
 * await mongoDB.connect(DBKey.DB_NOTES);
 */
const connect = async (
  dbKey: DBKey = DBKey.DB_BASE
): Promise<MongoDBConnectionResult> => {
  if (mongooseCache.connections[dbKey]) return null; // Already connected

  try {
    const { uri, mongooseOptions } = getConnectionConfig(dbKey);
    const connection = await mongoose
      .createConnection(uri, mongooseOptions)
      .asPromise();
    mongooseCache.connections[dbKey] = connection;
    logger.info(`MongoDB: (Mongoose) connected to ${dbKey}`);
    return null;
  } catch (error) {
    console.error(error);
    mongooseCache.connections[dbKey] = null;
    const errMsg = `MongoDB: (Mongoose) connection failed for ${dbKey}`;
    logger.error(errMsg);
    return errMsg;
  }
};

/**
 * Disconnects from a MongoDB database using Mongoose.
 *
 * @param {DBKey} [dbKey] - The database key to disconnect from. If not provided, disconnects from all databases.
 * @returns {Promise<MongoDBConnectionResult>} Returns null on success, or an error message string on failure.
 *
 * @example
 * // Disconnect from specific database
 * await mongoDB.disconnect(DBKey.DB_BASE);
 *
 * @example
 * // Disconnect from all databases
 * await mongoDB.disconnect();
 */
const disconnect = async (dbKey?: DBKey): Promise<MongoDBConnectionResult> => {
  try {
    if (dbKey) {
      // Disconnect specific database
      const connection = mongooseCache.connections[dbKey];
      if (connection) {
        await connection.close();
        delete mongooseCache.connections[dbKey];
        logger.info(`MongoDB: (Mongoose) disconnected from ${dbKey}`);
      }
    } else {
      // Disconnect all databases
      const keys = Object.keys(mongooseCache.connections) as DBKey[];
      for (const key of keys) {
        const connection = mongooseCache.connections[key];
        if (connection) {
          await connection.close();
        }
      }
      mongooseCache.connections = {} as Record<
        DBKey,
        mongoose.Connection | null
      >;
      logger.info(`MongoDB: (Mongoose) disconnected from all databases`);
    }
    return null;
  } catch (error) {
    console.error(error);
    const errMsg = `MongoDB: Failed to disconnect from MongoDB (Mongoose)`;
    logger.error(errMsg);
    return errMsg;
  }
};

// // Vector client connection functions (new)
// const connectVectorClient = async (): Promise<MongoDBConnectionResult> => {
//   if (vectorCache.client && vectorCache.db) {
//     return null; // Already connected
//   }

//   try {
//     const { uri, clientOptions } = getConnectionConfig();

//     vectorCache.client = new MongoClient(uri, clientOptions);
//     await vectorCache.client.connect();
//     vectorCache.db = vectorCache.client.db('chatai');

//     logger.info('MongoDB: (Vector Client) connected');
//     return null;
//   } catch (error) {
//     console.error('MongoDB: Vector Client connection error:', error);
//     vectorCache.client = null;
//     vectorCache.db = null;
//     const errMsg = 'MongoDB: (Vector Client) connection failed';
//     logger.error(errMsg);
//     return errMsg;
//   }
// };

// const disconnectVectorClient = async (): Promise<MongoDBConnectionResult> => {
//   try {
//     if (vectorCache.client) {
//       await vectorCache.client.close();
//       vectorCache.client = null;
//       vectorCache.db = null;
//       logger.info('MongoDB: (Vector Client) disconnected');
//     }
//     return null;
//   } catch (error) {
//     console.error('MongoDB: Vector client disconnect error:', error);
//     const errMsg = 'Failed to disconnect MongoDB (Vector Client)';
//     logger.error(errMsg);
//     return errMsg;
//   }
// };

// const getVectorDb = async (): Promise<Db> => {
//   const connectionResult = await connectVectorClient();
//   if (connectionResult) {
//     throw new Error(connectionResult);
//   }

//   if (!vectorCache.db) {
//     throw new Error('MongoDB: Vector database not initialized');
//   }

//   return vectorCache.db;
// };

// Public API
export const mongoDB = {
  connect,
  disconnect,
  isConnected: (dbKey: DBKey = DBKey.DB_BASE): boolean => {
    const connection = mongooseCache.connections[dbKey];
    return connection ? connection.readyState === 1 : false;
  },
  getConnectionState: (dbKey: DBKey = DBKey.DB_BASE): string => {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };
    const connection = mongooseCache.connections[dbKey];
    return connection
      ? states[connection.readyState] || 'unknown'
      : 'uninitialized';
  },
  getConnection: (dbKey: DBKey = DBKey.DB_BASE) =>
    mongooseCache.connections[dbKey],
  //
  // connectVectorClient,
  // disconnectVectorClient,
  // getVectorDb,
  // isVectorClientConnected: (): boolean => {
  //   return vectorCache.client !== null && vectorCache.db !== null;
  // },
  // // Creates the MongoDB Atlas search index
  // createSearchIndex: async (): Promise<void> => {
  //   try {
  //     const db = await mongoDB.getVectorDb();
  //     const collectionName = `person_vectors`;
  //     // Ensure collection exists by creating it if doesn't
  //     const collection = db.collection(collectionName);

  //     // Check if the shared index already exists
  //     const indexes = await collection.listSearchIndexes().toArray();
  //     const indexExists = indexes.some(
  //       (index) => index.name === 'person_vector_index'
  //     );

  //     if (indexExists) {
  //       return;
  //     }

  //     // Create the shared search index only if it doesn't exist
  //     await collection.createSearchIndex({
  //       name: `person_vector_index`,
  //       type: 'vectorSearch',
  //       definition: {
  //         fields: [
  //           {
  //             type: 'vector',
  //             path: 'embedding',
  //             numDimensions: 768, // Google Generative AI embeddings dimension
  //             similarity: 'cosine',
  //           },
  //           {
  //             type: 'filter',
  //             path: 'category', // Allows to filter docs relevant to category
  //           },
  //           {
  //             type: 'filter',
  //             path: 'personKey', // Allows to filter docs relevant to person
  //           },
  //         ],
  //       },
  //     });

  //     // console.log(`[Debug] MongoDB: Created search index for 'person_vector'.`);
  //   } catch (error) {
  //     console.error(
  //       `MongoDB: Failed to create search index for 'person_vector':`,
  //       error
  //     );
  //   }
  // },
  //
  // // Utility method to connect both
  // connectAll: async (): Promise<{
  //   mongoose: MongoDBConnectionResult;
  //   vectorClient: MongoDBConnectionResult;
  // }> => {
  //   const mongooseResult = await connect();
  //   const vectorResult = await connectVectorClient();
  //   return { mongoose: mongooseResult, vectorClient: vectorResult };
  // },
  //
  // // Utility method to disconnect both
  // disconnectAll: async (): Promise<{
  //   mongoose: MongoDBConnectionResult;
  //   vectorClient: MongoDBConnectionResult;
  // }> => {
  //   const mongooseResult = await disconnect();
  //   const vectorResult = await disconnectVectorClient();
  //   return { mongoose: mongooseResult, vectorClient: vectorResult };
  // },
};

export type MongoDBConnectionResult = string | null;
