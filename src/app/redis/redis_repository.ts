import { Client, Repository } from 'redis-om';
import { AccountModel, accountSchema } from './model/account';

export default class RedisRepository {
  private redisClient: Client;
  private accountRepository: Repository<AccountModel>;

  constructor(client: Client) {
    this.redisClient = client;
    this.accountRepository = client.fetchRepository(accountSchema);
  }

  public async generateIndexes() {
    await this.accountRepository.createIndex();
  }

  public getAccountRepository(): Repository<AccountModel> {
    return this.accountRepository;
  }
}
