import { Db, MongoClient } from 'mongodb';
import { exit } from 'process';

export default async (dbName = 'ep4'): Promise<Db> => {
  const url = process.env.MONGO_URL || 'mongodb://mongo:27017/';
  const client: MongoClient = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.log((error as Error).message);
    exit(1);
  }
};
