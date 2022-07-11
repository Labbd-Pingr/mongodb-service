import { exit } from 'process';
import { DataSource } from 'typeorm';
import { AccountModel } from './model/account';
import { ProfileModel } from './model/profile';

export default async (): Promise<DataSource> => {
  const appDataSource = new DataSource({
    type: 'postgres',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    host: 'postgres',
    database: process.env.POSTGRES_USER || 'postgres',
    entities: [ProfileModel, AccountModel],
    synchronize: true,
  });

  try {
    return await appDataSource.initialize();
  } catch (error) {
    console.log((error as Error).message);
    exit(1);
  }
};
