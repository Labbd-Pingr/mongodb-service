import { Db, MongoClient } from 'mongodb';

export default async (dbName = 'ep4'): Promise<Db | undefined> => {
  const url = process.env.MONGO_URL || 'mongodb://mongo:27017/';
  const client: MongoClient = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('post');
    return db;
  } catch (error) {
    console.log((error as Error).message);
  }
};
