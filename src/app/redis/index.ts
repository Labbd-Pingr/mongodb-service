import { exit } from 'process';
import { Client } from 'redis-om';
import RedisRepository from './redis_repository';

export default async (): Promise<RedisRepository> => {
  try {
    const url = 'redis://redis:6379';
    const client = new Client();

    const repository = new RedisRepository(await client.open(url));
    await repository.generateIndexes();

    return repository;
  } catch (error) {
    console.log((error as Error).message);
    exit(1);
  }
};
