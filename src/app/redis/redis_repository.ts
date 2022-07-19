import { Client, Repository } from 'redis-om';
import { AccountModel, accountSchema } from './model/account';

export default class RedisRepository {
  private sessionRepository: Repository<AccountModel>;

  constructor(client: Client) {
    this.sessionRepository = client.fetchRepository(accountSchema);
  }

  public async generateIndexes() {
    await this.sessionRepository.createIndex();
  }

  public getSessionRepository(): Repository<AccountModel> {
    return this.sessionRepository;
  }
}
